using System.Net.Http;
using System.Text;
using System.Text.Json;
using LlamaDashboard.Models;

namespace LlamaDashboard.Services;

public interface ILlamaCppService
{
    Task<Models.ModelsResponse> GetModels();
    Task<Models.ModelsResponse> LoadModel(string modelName);
    Task<Models.ModelsResponse> UnloadModel(string? modelName = null);
    Task<Models.Stats> GetStats();
    Task<List<Models.Device>> GetDevices();
    Task<Models.ChatResponse> SendChat(string? model, List<Models.ChatMessage> messages);
    Task<bool> CheckHealth();
}

public class LlamaCppService : ILlamaCppService
{
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly Models.DashboardConfig _config;

    public LlamaCppService(string baseUrl, string apiKey, Models.DashboardConfig? config = null)
    {
        _baseUrl = baseUrl.TrimEnd('/');
        _apiKey = apiKey;
        _config = config ?? new Models.DashboardConfig();
        
        if (_baseUrl.EndsWith("/v1"))
        {
            _baseUrl = _baseUrl[..^3];
        }
        
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(_baseUrl),
            Timeout = TimeSpan.FromSeconds(30)
        };
        
        if (!string.IsNullOrEmpty(_apiKey))
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    public async Task<Models.ModelsResponse> GetModels()
    {
        try
        {
            var response = await _httpClient.GetStringAsync("/v1/models");
            var data = System.Text.Json.JsonSerializer.Deserialize<Models.ModelsResponse>(response);
            return data ?? new Models.ModelsResponse { Success = true };
        }
        catch (Exception ex)
        {
            return new Models.ModelsResponse { Success = true, Warning = ex.Message };
        }
    }

    public async Task<Models.ModelsResponse> LoadModel(string modelName)
    {
        try
        {
            var payload = new { model = modelName };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            
            // Model management routes are not under the /v1 prefix.
            var response = await _httpClient.PostAsync("/models/load", content);
            if (!response.IsSuccessStatusCode)
            {
                return new Models.ModelsResponse
                {
                    Success = false,
                    Warning = $"Failed to load model: {await ReadErrorMessage(response)}"
                };
            }

            return new Models.ModelsResponse
            {
                Success = true,
                Warning = $"Model {modelName} is loading"
            };
        }
        catch (Exception ex)
        {
            return new Models.ModelsResponse 
            { 
                Success = false, 
                Warning = $"Failed to load model: {ex.Message}" 
            };
        }
    }

    public async Task<Models.ModelsResponse> UnloadModel(string? modelName = null)
    {
        try
        {
            var payload = modelName != null ? (object)new { model = modelName } : new { };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            
            var response = await _httpClient.PostAsync("/models/unload", content);
            if (!response.IsSuccessStatusCode)
            {
                return new Models.ModelsResponse
                {
                    Success = false,
                    Warning = $"Failed to unload model: {await ReadErrorMessage(response)}"
                };
            }

            return new Models.ModelsResponse
            {
                Success = true,
                Warning = "Model unloaded successfully"
            };
        }
        catch (Exception ex)
        {
            return new Models.ModelsResponse 
            { 
                Success = false, 
                Warning = $"Failed to unload model: {ex.Message}" 
            };
        }
    }

    // The router-mode server has no /stats endpoint; aggregate the Prometheus
    // /metrics of every loaded model instead.
    public async Task<Models.Stats> GetStats()
    {
        var stats = new Models.Stats();
        try
        {
            var models = await GetModels();
            foreach (var model in models.Data.Where(m => m.Loaded))
            {
                var text = await _httpClient.GetStringAsync(
                    $"/metrics?model={Uri.EscapeDataString(model.Id)}");
                var metrics = ParseMetrics(text);
                stats.PromptCount += (long)metrics.GetValueOrDefault("llamacpp:prompt_tokens_total");
                stats.EvalCount += (long)metrics.GetValueOrDefault("llamacpp:tokens_predicted_total");
                stats.PromptTime += metrics.GetValueOrDefault("llamacpp:prompt_seconds_total") * 1000;
                stats.EvalTime += metrics.GetValueOrDefault("llamacpp:tokens_predicted_seconds_total") * 1000;
            }

            stats.TokenCount = stats.PromptCount + stats.EvalCount;
            if (stats.PromptCount > 0) stats.PromptPerTokenMs = stats.PromptTime / stats.PromptCount;
            if (stats.EvalCount > 0) stats.EvalPerTokenMs = stats.EvalTime / stats.EvalCount;
        }
        catch
        {
            // Server unreachable or metrics disabled; return whatever was collected.
        }
        return stats;
    }

    private static async Task<string> ReadErrorMessage(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var error) &&
                error.TryGetProperty("message", out var message))
            {
                return message.GetString() ?? body;
            }
        }
        catch (JsonException)
        {
        }
        return string.IsNullOrWhiteSpace(body) ? $"HTTP {(int)response.StatusCode}" : body;
    }

    private static Dictionary<string, double> ParseMetrics(string prometheusText)
    {
        var result = new Dictionary<string, double>();
        foreach (var line in prometheusText.Split('\n'))
        {
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#')) continue;
            var idx = line.LastIndexOf(' ');
            if (idx <= 0) continue;
            var name = line[..idx];
            var brace = name.IndexOf('{');
            if (brace >= 0) name = name[..brace];
            if (double.TryParse(line[(idx + 1)..],
                System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture,
                out var value))
            {
                result[name.Trim()] = value;
            }
        }
        return result;
    }

    public async Task<List<Models.Device>> GetDevices()
    {
        try
        {
            var gpuService = new NvidiaSmiGpuService();
            var gpuInfo = await gpuService.GetGpuInfo();
            
            int usedMb = 0;
            try
            {
                var models = await GetModels();
                usedMb = (int)(models.Data.Where(m => m.Loaded).Sum(m => m.Size ?? 0) / (1024 * 1024));
            }
            catch
            {
                // Server unreachable; use nvidia-smi reported usage
                usedMb = gpuInfo.UsedMemoryMB;
            }

            return new List<Models.Device>
            {
                new Models.Device
                {
                    Id = 0,
                    Name = gpuInfo.Name,
                    Vendor = "NVIDIA",
                    Vram = gpuInfo.TotalMemoryMB,
                    VramUsed = usedMb,
                    VramFree = Math.Max(0, gpuInfo.TotalMemoryMB - usedMb),
                    CudaVersion = "",
                    Status = "available",
                    Type = "GPU",
                    Temperature = gpuInfo.Temperature,
                    PowerUsage = gpuInfo.PowerUsageW,
                    PowerCap = gpuInfo.PowerCapW,
                    Utilization = gpuInfo.Utilization
                }
            };
        }
        catch
        {
            return new List<Models.Device>
            {
                new Models.Device
                {
                    Id = 0,
                    Name = "Unknown GPU",
                    Vendor = "NVIDIA",
                    Vram = 0,
                    VramUsed = 0,
                    VramFree = 0,
                    CudaVersion = "",
                    Status = "available",
                    Type = "GPU",
                    Temperature = 0,
                    PowerUsage = 0,
                    PowerCap = 0,
                    Utilization = 0
                }
            };
        }
    }

    public async Task<Models.ChatResponse> SendChat(string? model, List<Models.ChatMessage> messages)
    {
        try
        {
            var payload = new ChatRequest 
            { 
                Model = model ?? "default", 
                Messages = messages 
            };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            
            var response = await _httpClient.PostAsync("/v1/chat/completions", content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new Models.ChatResponse
                {
                    Success = false,
                    Error = $"Server returned {(int)response.StatusCode}: {responseString}"
                };
            }

            var data = System.Text.Json.JsonSerializer.Deserialize<Models.ChatResponse>(responseString);
            return data ?? new Models.ChatResponse { Success = false, Error = "Invalid response" };
        }
        catch (Exception ex)
        {
            return new Models.ChatResponse 
            { 
                Success = false, 
                Error = $"Chat failed: {ex.Message}" 
            };
        }
    }

    public async Task<bool> CheckHealth()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
