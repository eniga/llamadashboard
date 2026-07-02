using LlamaDashboard.Models;

namespace LlamaDashboard.Services;

public interface IConfigService
{
    string GetLlamaCppUrl();
    string GetLlamaCppApiKey();
    DashboardConfig GetConfig();
    void SaveConfig(DashboardConfig config);
}

public class ConfigService : IConfigService
{
    private readonly IConfiguration _configuration;
    private DashboardConfig _config = new();

    public ConfigService(IConfiguration configuration)
    {
        _configuration = configuration;
        _config = new DashboardConfig
        {
            LlamaCppUrl = _configuration["LlamaCpp:Url"] ?? "https://llm.aradhel.dev/v1",
            LlamaCppApiKey = _configuration["LlamaCpp:ApiKey"] ?? "",
            DashboardName = _configuration["Dashboard:Name"] ?? "Llama Dashboard",
            RefreshInterval = int.Parse(_configuration["LlamaCpp:RefreshInterval"] ?? "10000"),
            Theme = _configuration["Dashboard:Theme"] ?? "dark",
            MaxTokens = int.Parse(_configuration["Dashboard:MaxTokens"] ?? "4096"),
            PrimaryGpu = _configuration["GPU:Primary"] ?? "NVIDIA RTX PRO 4000 Blackwell",
            VramMB = int.Parse(_configuration["GPU:VramMB"] ?? "24576"),
            CudaVersion = _configuration["GPU:CudaVersion"] ?? "12.x"
        };
    }

    public string GetLlamaCppUrl() => _config.LlamaCppUrl;
    public string GetLlamaCppApiKey() => _config.LlamaCppApiKey;
    
    public DashboardConfig GetConfig() => _config;
    
    public void SaveConfig(DashboardConfig config)
    {
        _config = config;
    }
}
