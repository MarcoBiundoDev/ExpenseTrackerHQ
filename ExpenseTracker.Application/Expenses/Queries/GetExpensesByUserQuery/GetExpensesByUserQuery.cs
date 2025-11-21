using ExpenseTracker.Application.Expenses.Dtos;
using ExpenseTracker.Domain.Entities;
using MediatR;

namespace ExpenseTracker.Application.Expenses.Queries.GetExpensesByUserQuery;

public record  GetExpensesByUserQuery(Guid UserId) : IRequest<IEnumerable<ExpenseDto>>;
