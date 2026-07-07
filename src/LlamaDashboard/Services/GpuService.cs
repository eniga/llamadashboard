using System.Diagnostics;

namespace LlamaDashboard.Services;

public interface IGpuService
{
    Task<GpuInfo> GetGpuInfo();
}

public class GpuInfo
{
    public string Name { get; set; } = "";
    public int TotalMemoryMB { get; set; }
    public int UsedMemoryMB { get; set; }
    public int FreeMemoryMB => TotalMemoryMB - UsedMemoryMB;
    public int Temperature { get; set; }
    public int PowerUsageW { get; set; }
    public int PowerCapW { get; set; }
    public int Utilization { get; set; }
    public string DriverVersion { get; set; } = "";
    public string CudaVersion { get; set; } = "";
}

public class NvidiaSmiGpuService : IGpuService
{
    public async Task<GpuInfo> GetGpuInfo()
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "nvidia-smi",
                Arguments = "--query-gpu=name,memory.total,memory.used,temperature.gpu,power.draw,power.limit,utilization.gpu,driver_version,cuda_version --format=csv,noheader,nounits",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null)
            {
                return GetDefaultGpuInfo();
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var exitCode = await process.WaitForExitAsync(TimeSpan.FromSeconds(5));
            
            if (!exitCode || string.IsNullOrWhiteSpace(output))
            {
                return GetDefaultGpuInfo();
            }

            var lines = output.Trim().Split('\n');
            if (lines.Length == 0)
            {
                return GetDefaultGpuInfo();
            }

            var parts = lines[0].Split(',').Select(p => p.Trim()).ToArray();
            if (parts.Length < 7)
            {
                return GetDefaultGpuInfo();
            }

            return new GpuInfo
            {
                Name = parts[0],
                TotalMemoryMB = int.TryParse(parts[1], out var total) ? total : 24576,
                UsedMemoryMB = int.TryParse(parts[2], out var used) ? used : 0,
                Temperature = int.TryParse(parts[3], out var temp) ? temp : 0,
                PowerUsageW = int.TryParse(parts[4], out var pwr) ? pwr : 0,
                PowerCapW = int.TryParse(parts[5], out var cap) ? cap : 145,
                Utilization = int.TryParse(parts[6], out var util) ? util : 0,
                DriverVersion = parts.Length > 7 ? parts[7] : "",
                CudaVersion = parts.Length > 8 ? parts[8] : ""
            };
        }
        catch
        {
            return GetDefaultGpuInfo();
        }
    }

    private GpuInfo GetDefaultGpuInfo()
    {
        return new GpuInfo
        {
            Name = "NVIDIA RTX PRO 4000 Blackwell",
            TotalMemoryMB = 24576,
            UsedMemoryMB = 0,
            Temperature = 0,
            PowerUsageW = 0,
            PowerCapW = 145,
            Utilization = 0,
            DriverVersion = "595.71.05",
            CudaVersion = "13.2"
        };
    }
}
