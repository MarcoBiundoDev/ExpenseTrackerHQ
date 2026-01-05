

# Sprint 5.1 — OpenTelemetry Integration (Observability Foundation)

## Purpose of This Document

This document is the **authoritative reference (“holy bible”)** for Sprint 5.1 of Phase 5 – Observability & Reliability.

It is written so that:
- You can **re‑implement this entire sprint in a different project** without rediscovering decisions
- Every **design choice is justified** (what I did, what I avoided, and why)
- Every **command and line of code** is explained at a senior / production level

Sprint 5.1 establishes **end‑to‑end distributed tracing and metrics** using **OpenTelemetry** and **Azure Monitor / Application Insights** in a Kubernetes (AKS) environment.

---

## Sprint 5.1 Scope (Locked)

### Feature 16 — OpenTelemetry Integration

**Goals:**
- Enable distributed tracing across the API
- Export traces and metrics to Azure Monitor / Application Insights
- Instrument core business logic (command + query handlers)
- Avoid click‑ops and remain fully IaC‑driven
- Ensure solution is production‑safe in AKS

**Explicitly out of scope (by design):**
- Shipping application logs to Application Insights via Serilog
- Alerting and dashboards (Sprint 5.2)

---

## High‑Level Architecture

```text
Client
  │
  ▼
API (ASP.NET Core)
  ├─ OpenTelemetry SDK
  │    ├─ Traces (Activities / Spans)
  │    └─ Metrics (Runtime + ASP.NET)
  │
  ▼
Azure Monitor Exporter
  │
  ▼
Application Insights
  ├─ requests
  ├─ dependencies
  └─ traces (eventually consistent)
```

Key principle:
> **OpenTelemetry is responsible for observability signals.**
> **Serilog remains console‑only for Kubernetes log streaming.**

---

## Step 1 — Azure Infrastructure (IaC)

### Why Infrastructure First

OpenTelemetry exporters **fail hard** if their backend does not exist.

Therefore:
- Application Insights **must be created first**
- Connection string **must be injected via Key Vault**
- Application code **must never assume presence** of config at runtime

### Terraform Design

A dedicated **observability module** was created:

```text
infra/terraform/modules/observability
  ├─ main.tf
  ├─ variables.tf
  └─ outputs.tf
```

**Why a module?**
- Observability is cross‑cutting
- Will be reused across environments
- Keeps `env/dev/main.tf` clean

### Resources Created

- Resource Group (Observability scoped)
- Application Insights (workspace‑based)
- Log Analytics Workspace
- Key Vault secret containing:
  - `ApplicationInsights--ConnectionString`

> Naming uses double dashes (`--`) so Azure Key Vault maps correctly to `ApplicationInsights:ConnectionString` in .NET.

---

## Step 2 — NuGet Packages (API Project)

All packages are installed **only in the API host**, never in Application/Domain layers.

### Installed Packages

```bash
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
dotnet add package OpenTelemetry.Instrumentation.Http
dotnet add package OpenTelemetry.Instrumentation.Runtime
dotnet add package Azure.Monitor.OpenTelemetry.Exporter
```

### Why These Packages

| Package | Reason |
|------|------|
| `OpenTelemetry.Extensions.Hosting` | Integrates OTEL with ASP.NET DI lifecycle |
| `AspNetCore` instrumentation | Automatic request tracing |
| `Http` instrumentation | Outgoing HTTP dependency tracing |
| `Runtime` instrumentation | CPU, GC, threadpool metrics |
| Azure Monitor exporter | Sends signals to Application Insights |

No logging exporters were added in this sprint **by design**.

---

## Step 3 — Program.cs (Core of Sprint 5.1)

### Configuration Source

```csharp
var appInsightsConnectionString =
    builder.Configuration["ApplicationInsights:ConnectionString"];
```

- Value is injected from **Key Vault → AKS → Environment Variable**
- Application **does not crash** if missing

### OpenTelemetry Registration

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource =>
        resource.AddService(Telemetry.ServiceName))
    .WithTracing(tracing =>
    {
        tracing
            .AddSource(ExpenseTracker.Application.Observability.ActivitySources.Name)
            .AddSource(Telemetry.ActivitySourceName)
            .AddAspNetCoreInstrumentation(options =>
            {
                options.Filter = ctx =>
                    !ctx.Request.Path.StartsWithSegments("/health");
            })
            .AddHttpClientInstrumentation();
    })
    .WithMetrics(metrics =>
    {
        metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation();
    });
```

### Explanation (Line by Line)

- `AddService(...)`
  - Sets `service.name` for trace grouping in App Insights
- `AddSource(...)`
  - Explicitly allows custom spans created in Application layer
- `AspNetCoreInstrumentation`
  - Auto‑creates request spans
  - Health endpoint excluded to reduce noise
- `HttpClientInstrumentation`
  - Auto‑creates dependency spans
- `RuntimeInstrumentation`
  - Enables CPU, GC, threadpool metrics

### Azure Monitor Exporter

```csharp
if (!string.IsNullOrWhiteSpace(appInsightsConnectionString))
{
    builder.Services
        .AddOpenTelemetry()
        .UseAzureMonitor(o =>
        {
            o.ConnectionString = appInsightsConnectionString;
        });
}
```

**Critical rule learned:**
> Never mix `UseAzureMonitor(...)` with signal‑specific exporters.

This configuration uses **only the cross‑cutting exporter**, which is stable and production‑safe.

---

## Step 4 — Custom Instrumentation (Application Layer)

### Why Manual Spans

Auto‑instrumentation answers:
- *Where did the request go?*

Manual instrumentation answers:
- *What business operation happened?*

### ActivitySource Definition

```csharp
public static class ActivitySources
{
    public const string Name = "ExpenseTracker.Application";
}
```

### Command Handler Instrumentation (Create Expense)

```csharp
using var activity = ActivitySource.StartActivity(
    "Expense.Create",
    ActivityKind.Internal);

activity?.SetTag("expense.id", expense.Id);
activity?.SetTag("user.id", request.UserId);
```

### Query Handler Instrumentation (Get Expense)

```csharp
using var activity = ActivitySource.StartActivity(
    "Expense.GetById",
    ActivityKind.Internal);

activity?.SetTag("expense.id", request.ExpenseId);
activity?.SetTag("user.id", request.UserId);
```

### Why `ActivityKind.Internal`

- These spans are **inside** a request
- They are not network calls
- Correct semantic classification

---

## Step 5 — Container Build (Mac → AKS Safe)

### Problem

Mac builds produce ARM images.
AKS nodes expect `linux/amd64`.

### Solution (buildx)

```bash
docker buildx build \
  --platform linux/amd64 \
  -t <acr>.azurecr.io/expense-api:<tag> \
  -f apps/api/Dockerfile \
  . \
  --push
```

This is **mandatory** for every AKS deployment from macOS.

---

## Step 6 — Deployment (Helm)

- Image tag updated in `values-dev.yaml`
- Helm upgrade performed

```bash
helm upgrade --install expense-api \
  ./infra/helm/expense-api \
  -n expense-dev
```

---

## Step 7 — Verification (Critical Learnings)

### Initial Confusion

- `requests` and `dependencies` populated immediately
- `traces` table appeared empty

### Root Cause

Application Insights ingestion is **eventually consistent**.

> Traces can appear **5–20 minutes later**, especially for new exporters.

### Verification Queries

```kql
requests | order by timestamp desc
dependencies | order by timestamp desc
```

Later:

```kql
traces | order by timestamp desc
```

Custom spans appeared as:
- `InProc: Expense.Create`
- `InProc: Expense.GetById`

---

## Final State (End of Sprint 5.1)

### What Exists

- Distributed tracing end‑to‑end
- Runtime + HTTP metrics
- Business‑level spans
- Fully IaC‑driven
- AKS‑safe

### What Was Explicitly Avoided

- Direct Serilog → Application Insights sinks
- Over‑instrumentation
- Click‑ops

---

## Reusability Checklist (For Future Projects)

To repeat Sprint 5.1 in another system:

1. Create App Insights + LA Workspace (Terraform)
2. Store connection string in Key Vault
3. Inject into AKS as `ApplicationInsights__ConnectionString`
4. Install OTEL packages in API host
5. Register OTEL in `Program.cs`
6. Instrument business operations with `ActivitySource`
7. Build with `buildx --platform linux/amd64`
8. Deploy via Helm
9. Wait for ingestion

---

## Sprint 5.1 Status

✅ **Complete**

This sprint establishes the observability foundation for all future reliability, alerting, and performance work.

---