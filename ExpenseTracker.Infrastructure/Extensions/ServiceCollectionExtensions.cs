using System.IO.Compression;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using ExpenseTracker.Domain.Repositories;
using ExpenseTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Infrastructure.Persistence;

namespace ExpenseTracker.Infrastructure.Extensions;

        
public static class ServiceCollectionExtensions
{
    public static void AddInfrastructure(this IServiceCollection services, IConfiguration   configuration)
    {

        var connectionString = configuration.GetConnectionString("RestaurantsDb");
        services.AddDbContext<ExpensesDbContext>(options => options.UseSqlite(connectionString).EnableSensitiveDataLogging());
        services.AddScoped<IExpensesRepository, ExpensesRepository>();
    }




}       