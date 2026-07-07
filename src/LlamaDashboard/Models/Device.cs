namespace LlamaDashboard.Models;

public class Device
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Vendor { get; set; } = "NVIDIA";
    public int Vram { get; set; }
    public int VramUsed { get; set; }
    public int VramFree { get; set; }
    public string? CudaVersion { get; set; }
    public string? ComputeCapability { get; set; }
    public string Status { get; set; } = "available";
    public string Type { get; set; } = "GPU";
    public int Temperature { get; set; }
    public int PowerUsage { get; set; }
    public int PowerCap { get; set; }
    public int Utilization { get; set; }
}

public class DeviceConfig
{
    public string LlamaVersion { get; set; } = "built-in";
    public string Backend { get; set; } = "CUDA";
    public int DeviceCount { get; set; }
}
