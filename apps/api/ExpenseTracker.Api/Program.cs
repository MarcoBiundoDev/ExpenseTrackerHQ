
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using ExpenseTracker.Infrastructure.Extensions;
using ExpenseTracker.Application.Extensions;
using Serilog;
using FluentValidation.AspNetCore;
using ExpenseTracker.Api.Middlewares;
using ExpenseTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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
builder.Services.AddInfrastructure(builder.Configuration );
builder.Services.AddApplication();
builder.Services.AddHealthChecks();

builder.Host.UseSerilog((context, configuration) =>
    configuration
      .ReadFrom.Configuration(context.Configuration)  
);


var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ExpenseDbContext>();
    var runMigrations = builder.Configuration.GetValue<bool>("RunMigrations");
    if (runMigrations)
    {  
        dbContext.Database.Migrate();
    }
}

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapControllers();
app.Run();
