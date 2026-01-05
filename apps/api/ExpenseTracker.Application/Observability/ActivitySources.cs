using System.Diagnostics;

namespace ExpenseTracker.Application.Observability;

public static class ActivitySources
{
    public const string Name = "ExpenseTracker.Application";
    public static readonly ActivitySource Application = new(Name);
}