using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using ExpenseTracker.Infrastructure.Extensions;
using ExpenseTracker.Application.Extensions;
using Serilog;
using System.Diagnostics;
using FluentValidation.AspNetCore;
using ExpenseTracker.Api.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Azure.Monitor.OpenTelemetry.AspNetCore;
using OpenTelemetry.Metrics;
using ExpenseTracker.Api.Logging;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;
using Microsoft.ApplicationInsights.Extensibility;

var builder = WebApplication.CreateBuilder(args);

// --- Azure Key Vault configuration (Workload Identity / Managed Identity) ---
// If KeyVault__Uri is set (env var -> KeyVault:Uri), we add Key Vault as a configuration provider.
// This allows secrets like `ConnectionStrings--DefaultConnection` to bind to `ConnectionStrings:DefaultConnection`.
var keyVaultUri = builder.Configuration["KeyVault:Uri"];
if (!string.IsNullOrWhiteSpace(keyVaultUri))
{
    var secretClient = new SecretClient(new Uri(keyVaultUri), new DefaultAzureCredential());
    builder.Configuration.AddAzureKeyVault(secretClient, new KeyVaultSecretManager());
}

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddHealthChecks();

    var appInsightsConnectionString =
        builder.Configuration["AzureMonitor:ConnectionString"]
        ?? builder.Configuration["ApplicationInsights:ConnectionString"];

    var otel = builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource.AddService(Telemetry.ServiceName))
        .WithTracing(tracing =>
        {
            tracing
                // Your custom spans
                .AddSource(ExpenseTracker.Application.Observability.ActivitySources.Name)
                .AddSource(Telemetry.ActivitySourceName)
                // Auto instrumentation
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.Filter = httpContext =>
                        !httpContext.Request.Path.StartsWithSegments("/health");
                })
                .AddHttpClientInstrumentation();
        })
        .WithMetrics(metrics =>
        {
            metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation();
        });

    if (!string.IsNullOrWhiteSpace(appInsightsConnectionString))
    {
        otel.UseAzureMonitor(options =>
        {
            options.ConnectionString = appInsightsConnectionString;
        });
    }

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience = builder.Configuration["Auth:Audience"];

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.With(new ActivityEnricher());


    if (!string.IsNullOrWhiteSpace(appInsightsConnectionString))
    {
        var telemetryConfig = new TelemetryConfiguration
        {
            ConnectionString = appInsightsConnectionString
        };

        configuration.WriteTo.ApplicationInsights(telemetryConfig, TelemetryConverter.Traces);
    }
});

var app = builder.Build();



if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapControllers();
app.Run();


internal static class Telemetry
{
    public const string ServiceName = "expense-tracker-api";
    public const string ActivitySourceName = "ExpenseTracker.Api";
    public static readonly ActivitySource ActivitySource =
        new(ActivitySourceName);
}