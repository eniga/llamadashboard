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

    public LlamaCppService(string baseUrl, string apiKey)
    {
        _baseUrl = baseUrl.TrimEnd('/');
        _apiKey = apiKey;
        
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
            
            var response = await _httpClient.PostAsync("/v1/models/load", content);
            response.EnsureSuccessStatusCode();
            
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
            var payload = modelName != null ? new { model = modelName } : new { };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            
            var response = await _httpClient.PostAsync("/v1/models/unload", content);
            response.EnsureSuccessStatusCode();
            
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

    public async Task<Models.Stats> GetStats()
    {
        try
        {
            var response = await _httpClient.GetStringAsync("/stats");
            var stats = System.Text.Json.JsonSerializer.Deserialize<Models.Stats>(response);
            return stats ?? new Models.Stats();
        }
        catch
        {
            return new Models.Stats();
        }
    }

    public async Task<List<Models.Device>> GetDevices()
    {
        try
        {
            var models = await GetModels();
            var loadedModel = models.Data.FirstOrDefault(m => m.Loaded);
            var vramUsed = loadedModel?.Size ?? 0;
            
            return new List<Models.Device>
            {
                new Models.Device
                {
                    Id = 0,
                    Name = "NVIDIA RTX PRO 4000 Blackwell",
                    Vendor = "NVIDIA",
                    Vram = 24576,
                    VramUsed = vramUsed / (1024 * 1024),
                    VramFree = 24576 - (vramUsed / (1024 * 1024)),
                    CudaVersion = "12.x",
                    ComputeCapability = "5.2",
                    Status = "available",
                    Type = "GPU"
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
                    Name = "NVIDIA RTX PRO 4000 Blackwell",
                    Vendor = "NVIDIA",
                    Vram = 24576,
                    VramUsed = 0,
                    VramFree = 24576,
                    CudaVersion = "12.x",
                    ComputeCapability = "5.2",
                    Status = "available",
                    Type = "GPU"
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
