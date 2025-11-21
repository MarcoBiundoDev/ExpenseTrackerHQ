using MediatR;

namespace ExpenseTracker.Application.Expenses.Commands.UpdateExpense;

public record UpdateExpenseCommand
(
    Guid UserId,
    Guid ExpenseId,
    decimal Amount,
    string Currency,
    string Category,
    string? Description,
    DateTime Date
):  IRequest<bool>;