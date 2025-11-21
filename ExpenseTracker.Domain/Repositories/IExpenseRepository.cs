using ExpenseTracker.Domain.Entities;

namespace ExpenseTracker.Domain.Repositories;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> GetExpensesByUserAsync(
        Guid userId, 
        CancellationToken cancellationToken = default);
    Task<Expense?> GetExpenseByIdAsync(
        Guid userId,
        Guid expenseId, 
        CancellationToken cancellationToken = default);
    Task<Guid> AddExpenseAsync(
        Expense expense, CancellationToken cancellationToken = default);
    Task DeleteExpenseAsync(
        Expense expense, 
        CancellationToken cancellationToken = default);
    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}