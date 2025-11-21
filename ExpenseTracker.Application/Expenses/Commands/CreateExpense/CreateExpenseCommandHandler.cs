using AutoMapper;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExpenseTracker.Application.Expenses.Commands.CreateExpense;

public sealed class CreateExpenseCommandHandler(ILogger<CreateExpenseCommandHandler> logger, IExpenseRepository expenseRepository, IMapper mapper) : IRequestHandler<CreateExpenseCommand, Guid>
{
    private readonly ILogger<CreateExpenseCommandHandler> _logger = logger;
    private readonly IExpenseRepository _expenseRepository = expenseRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<Guid> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating a new expense for user {UserId}", request.UserId);

        var expense = _mapper.Map<Expense>(request);

        var expenseId = await _expenseRepository.AddExpenseAsync(expense, cancellationToken);
        await _expenseRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Expense {ExpenseId} created successfully for user {UserId}", expenseId, request.UserId);

        return expenseId;
    }
}