namespace LlamaDashboard.Models;

public class ModelInfo
{
    public string Id { get; set; } = "";
    public string? OwnedBy { get; set; }
    public bool Loaded { get; set; }
    public long? Size { get; set; }
    public string? Status { get; set; }
    public List<string>? Aliases { get; set; }
    public List<string>? Tags { get; set; }
}

public class ModelsResponse
{
    public List<ModelInfo> Data { get; set; } = new();
    public bool Success { get; set; } = true;
    public string? Warning { get; set; }
}
