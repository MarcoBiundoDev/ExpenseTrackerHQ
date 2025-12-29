# ------------------------------------------------------------
# ExpenseTracker.Migrations — Dockerfile (monorepo-aware)
# Build context: repo root (ExpenseTrackerHQ)
# Dockerfile path: apps/migrations/ExpenseTracker.Migrations/Dockerfile
# ------------------------------------------------------------

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first (layer caching)
COPY ["apps/migrations/ExpenseTracker.Migrations/ExpenseTracker.Migrations.csproj", "apps/migrations/ExpenseTracker.Migrations/"]
COPY ["apps/api/ExpenseTracker.Infrastructure/ExpenseTracker.Infrastructure.csproj", "apps/api/ExpenseTracker.Infrastructure/"]
COPY ["apps/api/ExpenseTracker.Application/ExpenseTracker.Application.csproj", "apps/api/ExpenseTracker.Application/"]
COPY ["apps/api/ExpenseTracker.Domain/ExpenseTracker.Domain.csproj", "apps/api/ExpenseTracker.Domain/"]

RUN dotnet restore "apps/migrations/ExpenseTracker.Migrations/ExpenseTracker.Migrations.csproj"

# Copy repo
COPY . .

WORKDIR "/src/apps/migrations/ExpenseTracker.Migrations"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ExpenseTracker.Migrations.dll"]