namespace LlamaDashboard.Models;

public class Device
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Vendor { get; set; } = "NVIDIA";
    public long Vram { get; set; }
    public long VramUsed { get; set; }
    public long VramFree { get; set; }
    public string? CudaVersion { get; set; }
    public string? ComputeCapability { get; set; }
    public string Status { get; set; } = "available";
    public string Type { get; set; } = "GPU";
}

public class DeviceConfig
{
    public string LlamaVersion { get; set; } = "built-in";
    public string Backend { get; set; } = "CUDA";
    public int DeviceCount { get; set; }
}
