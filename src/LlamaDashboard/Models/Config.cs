namespace LlamaDashboard.Models;

public class DashboardConfig
{
    public string LlamaCppUrl { get; set; } = "https://llm.aradhel.dev/v1";
    public string LlamaCppApiKey { get; set; } = "";
    public string DashboardName { get; set; } = "Llama Dashboard";
    public int RefreshInterval { get; set; } = 10000;
    public string Theme { get; set; } = "dark";
    public int MaxTokens { get; set; } = 4096;
    public string PrimaryGpu { get; set; } = "NVIDIA RTX PRO 4000 Blackwell";
    public int VramMB { get; set; } = 24576;
    public string CudaVersion { get; set; } = "12.x";
}
