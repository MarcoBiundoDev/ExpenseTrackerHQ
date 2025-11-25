using AutoMapper;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExpenseTracker.Application.Expenses.Commands.CreateExpense;

public sealed class CreateExpenseCommandHandler(ILogger<CreateExpenseCommandHandler> logger, IExpensesRepository expenseRepository, IMapper mapper, IUnitOfWork unitOfWork) : IRequestHandler<CreateExpenseCommand, Guid>
{
    private readonly ILogger<CreateExpenseCommandHandler> _logger = logger;
    private readonly IExpensesRepository _expenseRepository = expenseRepository;
    private readonly IMapper _mapper = mapper;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    public async Task<Guid> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating a new expense for user {UserId}", request.UserId);

        var expense = _mapper.Map<Expense>(request);

        var expenseId = await _expenseRepository.AddExpenseAsync(expense, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Expense {ExpenseId} created successfully for user {UserId}", expenseId, request.UserId);

        return expenseId;
    }
}