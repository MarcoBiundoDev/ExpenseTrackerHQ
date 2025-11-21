
using MediatR;

namespace ExpenseTracker.Application.Expenses.Commands.DeleteExpense;

public record DeleteExpenseCommand(Guid UserId, Guid ExpenseId) : IRequest<bool>;

