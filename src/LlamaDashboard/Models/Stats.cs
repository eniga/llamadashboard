namespace LlamaDashboard.Models;

public class Stats
{
    public long TokenCount { get; set; }
    public long PromptCount { get; set; }
    public long EvalCount { get; set; }
    public double TokenTime { get; set; }
    public double PromptTime { get; set; }
    public double EvalTime { get; set; }
    public double? PromptPerTokenMs { get; set; }
    public double? EvalPerTokenMs { get; set; }
}
