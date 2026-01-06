# Observability — ExpenseTrackerHQ

This document explains **how observability is implemented, how to use it, and what design decisions were made** for the ExpenseTrackerHQ system.

It is intended for:
- New engineers onboarding to the project
- Reviewers evaluating system maturity
- Operators troubleshooting issues in production-like environments

This README is **deliberately concise and opinionated**.

---
## 1. Observability Goals

The observability stack is designed to answer three questions quickly:

1. Is the system healthy?
2. If not, where is the problem?
3. Is the issue application-level or infrastructure-level?

The implementation prioritizes:
- High-signal telemetry
- Low operational noise
- Cost-aware alerting
- Clear separation between application and platform concerns

---
## 2. Telemetry Overview

ExpenseTrackerHQ emits **three types of telemetry**:

| Signal | Purpose |
|-----|-----|
| Traces | Follow a request end-to-end |
| Metrics | Quantify performance and health |
| Logs | Provide human-readable context |

All telemetry is correlated using **TraceId / SpanId**.

---
## 3. Architecture Overview

```
Client
  ↓
API (ASP.NET Core)
  ├─ OpenTelemetry SDK
  ├─ Traces + Metrics + Logs
  ↓
Azure Monitor
  ├─ Application Insights (App telemetry)
  ├─ Log Analytics Workspace (AKS telemetry)
  ↓
Azure Workbooks & Alerts
```

---
## 4. Application Observability

### 4.1 Tracing

- Implemented using **OpenTelemetry**
- Automatic instrumentation:
  - ASP.NET Core requests
  - HTTP client calls
- Manual instrumentation:
  - Command handlers
  - Query handlers

Custom spans allow tracing through:
- Expense creation
- Expense retrieval
- Downstream dependencies (SQL, HTTP)

---
### 4.2 Metrics

Application metrics include:
- Request rate
- Request latency (p95)
- Error rate
- Dependency latency

Metrics are used for:
- Trend analysis
- Performance regression detection
- Alerting (selectively)

---
### 4.3 Logs

Logs are:
- Structured
- Correlated with traces
- Exported to Azure Monitor

Logs are intended for **context**, not primary alerting.

---
## 5. Platform (AKS) Observability

AKS telemetry is collected via **Azure Monitor for Containers**.

Signals include:
- Pod restarts
- Kubernetes warning events
- CPU and memory utilization
- Disk usage metrics

This data is queried through the **Log Analytics Workspace** and visualized alongside application telemetry.

---
## 6. Dashboards

Dashboards are implemented using **Azure Monitor Workbooks**.

### Application Panels
- Request rate
- Request latency (p95)
- Error rate (%)
- Top failing endpoints
- Dependency latency

### AKS Panels
- Pod restarts
- CrashLoop / BackOff events
- Disk usage (%)

Dashboards support:
- Global time range selection
- Live debugging
- Historical analysis

---
## 7. Alerts

### Implemented Alerts
- **High Error Rate Alert**
  - Based on Application Insights data
  - Triggers on sustained elevated failure rates

### Intentionally Skipped Alerts
- Latency alerts
- AKS health alerts

**Rationale:**
- Dashboards already surface these signals
- Alerts add recurring cost
- Alert fatigue is avoided by design

This demonstrates **signal discipline and cost awareness**.

---
## 8. How to Use Observability

### Common Workflow
1. Check dashboards for anomalies
2. Identify affected endpoints or services
3. Drill into traces for request-level detail
4. Use logs for contextual information
5. Verify platform health if symptoms persist

---
## 9. What This System Does NOT Do

This observability setup intentionally avoids:
- Alerting on every metric
- Complex SLO definitions
- External visualization tools (Grafana)
- Over-instrumentation

The goal is **clarity over completeness**.

---
## 10. Summary

ExpenseTrackerHQ’s observability stack:
- Uses modern OpenTelemetry standards
- Separates application and infrastructure concerns
- Emphasizes actionable insight
- Demonstrates production-minded trade-offs

This provides a solid foundation that can be extended without rework.

---
