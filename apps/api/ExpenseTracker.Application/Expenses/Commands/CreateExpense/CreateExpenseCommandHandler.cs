using AutoMapper;
using ExpenseTracker.Application.Common.Results;
using ExpenseTracker.Application.Expenses.Dtos;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace ExpenseTracker.Application.Expenses.Commands.CreateExpense;

public sealed class CreateExpenseCommandHandler(ILogger<CreateExpenseCommandHandler> logger, IExpensesRepository expenseRepository, IMapper mapper, IUnitOfWork unitOfWork) : IRequestHandler<CreateExpenseCommand, Result<ExpenseDto>>
{
    private readonly ILogger<CreateExpenseCommandHandler> _logger = logger;
    private readonly IExpensesRepository _expenseRepository = expenseRepository;
    private readonly IMapper _mapper = mapper;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private static readonly ActivitySource ActivitySource = new("ExpenseTracker.Application");

    public async Task<Result<ExpenseDto>> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        using var activity = ActivitySource.StartActivity("Expense.Create", ActivityKind.Internal);

        // Low-cardinality, useful business tags for troubleshooting (safe for a demo)
        activity?.SetTag("app.operation", "create-expense");
        activity?.SetTag("user.id", request.UserId);

        try
        {
            _logger.LogInformation("Creating a new expense for user {UserId}", request.UserId);

            var expense = _mapper.Map<Expense>(request);

            var expenseId = await _expenseRepository.AddExpenseAsync(expense, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Add identifiers after creation (avoid tagging before we have an id)
            activity?.SetTag("expense.id", expenseId);
            activity?.SetStatus(ActivityStatusCode.Ok);

            _logger.LogInformation("Expense {ExpenseId} created successfully for user {UserId}", expenseId, request.UserId);

            return Result<ExpenseDto>.Ok(_mapper.Map<ExpenseDto>(expense));
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            throw;
        }
    }
}