
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["apps/api/ExpenseTracker.Api/ExpenseTracker.Api.csproj", "apps/api/ExpenseTracker.Api/"]
COPY ["apps/api/ExpenseTracker.Application/ExpenseTracker.Application.csproj", "apps/api/ExpenseTracker.Application/"]
COPY ["apps/api/ExpenseTracker.Infrastructure/ExpenseTracker.Infrastructure.csproj", "apps/api/ExpenseTracker.Infrastructure/"]
COPY ["apps/api/ExpenseTracker.Domain/ExpenseTracker.Domain.csproj", "apps/api/ExpenseTracker.Domain/"]


RUN dotnet restore "apps/api/ExpenseTracker.Api/ExpenseTracker.Api.csproj"


COPY . .


WORKDIR /src/apps/api/ExpenseTracker.Api
RUN dotnet publish "ExpenseTracker.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ================================
# STAGE 2: runtime image
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ExpenseTracker.Api.dll"]