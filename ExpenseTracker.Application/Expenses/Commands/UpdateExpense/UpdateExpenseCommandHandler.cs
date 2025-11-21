using ExpenseTracker.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExpenseTracker.Application.Expenses.Commands.UpdateExpense;

public sealed class UpdateExpenseCommandHandler(ILogger<UpdateExpenseCommandHandler> logger, IExpenseRepository expenseRepository) : IRequestHandler<UpdateExpenseCommand, bool>
{
    private readonly ILogger<UpdateExpenseCommandHandler> _logger = logger;
    private readonly IExpenseRepository _expenseRepository = expenseRepository;

    public async Task<bool> Handle(UpdateExpenseCommand request, CancellationToken cancellationToken)
    {

        _logger.LogInformation(
            "Handling UpdateExpenseCommand for UserId: {UserId}, ExpenseId: {ExpenseId}",
            request.UserId,
            request.ExpenseId);

        var expense = await _expenseRepository.GetExpenseByIdAsync(request.UserId, request.ExpenseId, cancellationToken);
        if (expense == null)
        {
            _logger.LogWarning(
                "Expense not found or not accessible for UserId: {UserId}, ExpenseId: {ExpenseId}",
                request.UserId,
                request.ExpenseId);
            return false;
        }

        expense.Amount = request.Amount;
        expense.Currency = request.Currency;
        expense.Category = request.Category;
        expense.Description = request.Description;
        expense.Date = request.Date;

        await _expenseRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Successfully updated ExpenseId: {ExpenseId} for UserId: {UserId}",
            request.ExpenseId,
            request.UserId);
            
        return true;
    }
}