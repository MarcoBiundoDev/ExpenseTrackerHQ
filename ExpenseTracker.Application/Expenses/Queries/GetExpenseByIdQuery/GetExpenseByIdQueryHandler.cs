using AutoMapper;
using ExpenseTracker.Application.Expenses.Dtos;
using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExpenseTracker.Application.Expenses.Queries.GetExpenseByIdQuery;

public sealed class GetExpenseByIdQueryHandler(
    ILogger<GetExpenseByIdQueryHandler> logger,
    IMapper mapper,
    IExpenseRepository expenseRepository)
    : IRequestHandler<GetExpenseByIdQuery, ExpenseDto?>
{
    private readonly ILogger<GetExpenseByIdQueryHandler> _logger = logger;
    private readonly IMapper _mapper = mapper;
    private readonly IExpenseRepository _expenseRepository = expenseRepository;

    
    public async Task<ExpenseDto?> Handle(
        GetExpenseByIdQuery request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling GetExpenseByIdQuery for UserId: {UserId}, ExpenseId: {ExpenseId}",
            request.UserId, request.ExpenseId);

        var expense = await _expenseRepository
            .GetExpenseByIdAsync(request.UserId, request.ExpenseId, cancellationToken);

        if (expense is null)
        {
            // Could be: not found OR not owned by this user.
            _logger.LogWarning(
                "Expense not found or not accessible for UserId: {UserId}, ExpenseId: {ExpenseId}",
                request.UserId, request.ExpenseId);

            return null;
        }

        _logger.LogInformation(
            "Retrieved expense for UserId: {UserId}, ExpenseId: {ExpenseId}",
            request.UserId, request.ExpenseId);

        return _mapper.Map<ExpenseDto>(expense);
    }
}