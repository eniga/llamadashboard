namespace LlamaDashboard.Models;

public class ChatMessage
{
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
}

public class ChatRequest
{
    public string? Model { get; set; }
    public List<ChatMessage> Messages { get; set; } = new();
}

public class ChatResponse
{
    public bool Success { get; set; } = true;
    public string? Error { get; set; }
    public List<Choice>? Choices { get; set; }
}

public class Choice
{
    public string Message { get; set; } = "";
}
