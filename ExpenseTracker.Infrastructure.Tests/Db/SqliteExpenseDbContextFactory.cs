using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Infrastructure.Persistence;

namespace ExpenseTracker.Infrastructure.Tests.Db;

public static class SqliteExpensesDbContextFactory
{
    public static ExpensesDbContext CreateContext()
    {
        // Each test gets its own in-memory SQLite database
        var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ExpensesDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ExpensesDbContext(options);

        // Ensure schema exists
        context.Database.EnsureCreated();

        return context;
    }
}