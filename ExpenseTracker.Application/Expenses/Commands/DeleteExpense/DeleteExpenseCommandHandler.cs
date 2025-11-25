using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExpenseTracker.Application.Expenses.Commands.DeleteExpense;

public sealed class DeleteExpenseCommandHandler(ILogger<DeleteExpenseCommandHandler> logger, IExpensesRepository expenseRepository, IUnitOfWork unitOfWork) : IRequestHandler<DeleteExpenseCommand, bool>
{
    private readonly ILogger<DeleteExpenseCommandHandler> _logger = logger;

    private readonly IExpensesRepository _expenseRepository = expenseRepository;

    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    public async Task<bool> Handle(DeleteExpenseCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling DeleteExpenseCommand for UserId: {UserId}, ExpenseId: {ExpenseId}",
            request.UserId, request.ExpenseId);

        var expense = await _expenseRepository.GetExpenseByIdAsync(request.UserId, request.ExpenseId, cancellationToken);

        if (expense is null)
        {
            _logger.LogWarning(
                "Expense not found or not accessible for UserId: {UserId}, ExpenseId: {ExpenseId}",
                request.UserId, request.ExpenseId);

            return false;
        }

        await _expenseRepository.DeleteExpense(expense, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Deleted expense for UserId: {UserId}, ExpenseId: {ExpenseId}",
            request.UserId, request.ExpenseId);
        return true;
    }
}