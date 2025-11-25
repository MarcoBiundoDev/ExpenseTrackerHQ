using System;
using System.Linq;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Repositories;
using ExpenseTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class ExpensesRepository(ExpensesDbContext dbContext) : IExpensesRepository
{
    public async Task<Guid> AddExpenseAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        await dbContext.Expenses.AddAsync(expense, cancellationToken);
        return expense.Id;
    }

    public Task DeleteExpense(Expense expense, CancellationToken cancellationToken = default)
    {
        dbContext.Expenses.Remove(expense);
        return Task.CompletedTask;
    }

    public Task<Expense?> GetExpenseByIdAsync(Guid userId, Guid expenseId, CancellationToken cancellationToken = default)
    {
       return dbContext.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId, cancellationToken);
    }

    public async Task<IEnumerable<Expense>> GetExpensesByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
       IReadOnlyList<Expense> expense = await dbContext.Expenses.Where(e => e.UserId == userId).AsNoTracking().ToListAsync(cancellationToken);
       return expense; 
    }
}
