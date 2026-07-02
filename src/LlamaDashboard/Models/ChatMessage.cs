using System.Text.Json.Serialization;

namespace LlamaDashboard.Models;

public class ChatMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "";

    [JsonPropertyName("content")]
    public string Content { get; set; } = "";
}

public class ChatRequest
{
    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("messages")]
    public List<ChatMessage> Messages { get; set; } = new();
}

public class ChatResponse
{
    [JsonIgnore]
    public bool Success { get; set; } = true;

    [JsonIgnore]
    public string? Error { get; set; }

    [JsonPropertyName("choices")]
    public List<Choice>? Choices { get; set; }
}

public class Choice
{
    [JsonPropertyName("message")]
    public ChatMessage? Message { get; set; }
}
