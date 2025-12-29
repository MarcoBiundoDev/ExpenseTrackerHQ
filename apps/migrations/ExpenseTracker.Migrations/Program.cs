using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using ExpenseTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

Console.WriteLine("=== ExpenseTracker.Migrations starting ===");

try
{
    // 1) Load config from env vars
    var builder = new ConfigurationBuilder()
        .AddEnvironmentVariables();

    var preConfig = builder.Build();

    // 2) Load Key Vault (required)
    var keyVaultUri = preConfig["KeyVault:Uri"]; // KeyVault__Uri -> KeyVault:Uri
    if (string.IsNullOrWhiteSpace(keyVaultUri))
    {
        Console.WriteLine("KeyVault:Uri missing. Set KeyVault__Uri. Exiting.");
        return 2;
    }

    Console.WriteLine($"Using Key Vault: {keyVaultUri}");
    var secretClient = new SecretClient(new Uri(keyVaultUri), new DefaultAzureCredential());
    builder.AddAzureKeyVault(secretClient, new KeyVaultSecretManager());

    var config = builder.Build();

    // 3) Pull DB connection string from Key Vault
    //    Must exist as secret name: ConnectionStrings--ExpenseTrackerDb
    var conn = config.GetConnectionString("ExpenseTrackerDb");
    if (string.IsNullOrWhiteSpace(conn))
    {
        Console.WriteLine("ConnectionStrings:ExpenseTrackerDb missing/empty. Exiting.");
        return 3;
    }

    // 4) Create DbContext and apply migrations
    var options = new DbContextOptionsBuilder<ExpenseDbContext>()
        .UseSqlServer(conn)
        .Options;

    await using var db = new ExpenseDbContext(options);

    Console.WriteLine("Applying EF Core migrations...");
    await db.Database.MigrateAsync();
    Console.WriteLine("Migrations applied ✅");

    return 0;
}
catch (Exception ex)
{
    Console.WriteLine("Migration runner failed ❌");
    Console.WriteLine(ex);
    return 1;
}
finally
{
    Console.WriteLine("=== ExpenseTracker.Migrations finished ===");
}