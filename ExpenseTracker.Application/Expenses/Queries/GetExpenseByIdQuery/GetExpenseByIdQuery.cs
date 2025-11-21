using ExpenseTracker.Application.Expenses.Dtos;
using MediatR;

namespace  ExpenseTracker.Application.Expenses.Queries.GetExpenseByIdQuery;


public record GetExpenseByIdQuery(Guid UserId, Guid ExpenseId)
    : IRequest<ExpenseDto?>;
