using System.Text.Json.Serialization;

namespace LlamaDashboard.Models;

public class ModelInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("owned_by")]
    public string? OwnedBy { get; set; }

    [JsonPropertyName("status")]
    public ModelStatus? Status { get; set; }

    [JsonPropertyName("meta")]
    public ModelMeta? Meta { get; set; }

    [JsonPropertyName("aliases")]
    public List<string>? Aliases { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }

    [JsonIgnore]
    public bool Loaded => string.Equals(Status?.Value, "loaded", StringComparison.OrdinalIgnoreCase);

    [JsonIgnore]
    public long? Size => Meta?.Size;
}

public class ModelStatus
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = "";

    [JsonPropertyName("args")]
    public List<string>? Args { get; set; }
}

public class ModelMeta
{
    [JsonPropertyName("size")]
    public long? Size { get; set; }

    [JsonPropertyName("n_params")]
    public long? NParams { get; set; }

    [JsonPropertyName("n_ctx")]
    public long? NCtx { get; set; }

    [JsonPropertyName("n_ctx_train")]
    public long? NCtxTrain { get; set; }
}

public class ModelsResponse
{
    [JsonPropertyName("data")]
    public List<ModelInfo> Data { get; set; } = new();

    [JsonIgnore]
    public bool Success { get; set; } = true;

    [JsonIgnore]
    public string? Warning { get; set; }
}
