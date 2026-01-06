# Sprint 5.2 — Dashboards & Alerts

**Phase:** 5 — Observability & Reliability  
**Sprint Goal:** Convert raw telemetry into actionable insight using dashboards and alerts, while demonstrating signal selection and cost-aware monitoring decisions.

---
## 1. Sprint Scope & Intent

By the end of Sprint 5.1, the system was emitting:
- Distributed traces via OpenTelemetry
- Metrics via ASP.NET Core, HTTP client, runtime, and AKS
- Logs correlated with trace and span IDs
- Data flowing into Application Insights and Log Analytics

**Sprint 5.2 focuses on the consumption layer**:
- Turning telemetry into **dashboards**
- Defining **golden signals**
- Creating **alerts with operational intent**
- Making explicit decisions about what *not* to alert on

This sprint intentionally avoids alert sprawl and prioritizes high-signal, low-noise monitoring.

---
## 2. Telemetry Sources Used

### Application Insights (via Logs Analytics)
Used for:
- HTTP request rates
- Latency (duration)
- Error rates (failed requests)
- Dependency behavior

Tables queried:
- `requests`
- `dependencies`
- `exceptions`
- `traces`

> Note: In Azure Workbooks, **Application Insights data is accessed through `Logs (Analytics)`**, not a separate “Application Insights” data source.

---
### AKS / Azure Monitor Metrics
Used for:
- Node CPU & memory utilization
- Pod counts and health
- Kubernetes runtime metrics
- Container-level resource usage

Metrics surfaced included:
- `process_resident_memory_bytes`
- `kube_deployment_status_replicas_ready`
- `kubelet_runtime_operations_total`
- Network I/O metrics
- Disk usage metrics

---
## 3. Dashboard Implementation

Dashboards were implemented using **Azure Monitor Workbooks**.

**Navigation path:**
```
Azure Portal → Monitor → Workbooks → New
```

Data source for all panels:
- **Logs (Analytics)**

Resource type:
- **Application Insights** (for app-level panels)
- **Azure Monitor / AKS** (for infra panels)

---
## 4. Dashboard Panels Created

### Panel 1 — Request Rate (RPS)
**Purpose:** Detect traffic spikes and drops.

```kql
requests
| summarize RequestsPerMinute = count() by bin(timestamp, 1m)
| order by timestamp asc
```

---
### Panel 2 — Average Request Latency
**Purpose:** Track performance degradation.

```kql
requests
| summarize AvgDurationMs = avg(duration) by bin(timestamp, 1m)
```

---
### Panel 3 — Error Rate
**Purpose:** Detect functional failures.

```kql
requests
| summarize ErrorCount = countif(success == false) by bin(timestamp, 5m)
```

---
### Panel 4 — Top Slow Endpoints
**Purpose:** Identify performance bottlenecks.

```kql
requests
| summarize AvgDurationMs = avg(duration) by name
| order by AvgDurationMs desc
```

---
### Panel 5 — Dependency Latency
**Purpose:** Surface downstream slowness (e.g., SQL).

```kql
dependencies
| summarize AvgDurationMs = avg(duration) by target
```

---
### Panel 6 — Exception Volume
**Purpose:** Track unhandled or unexpected failures.

```kql
exceptions
| summarize Count = count() by type
```

---
### Panel 7 — AKS Resource Utilization
**Purpose:** Observe infrastructure pressure.

Metrics visualized via Azure Monitor:
- CPU utilization
- Memory utilization
- Pod counts
- Node health

---
## 5. Time Range Handling

- All panels support the **global time range picker**
- Default view validated at **Last 24 Hours**
- Charts dynamically update when the time range changes

This ensures dashboards are usable for:
- Live debugging
- Historical analysis
- Incident review

---
## 6. Alerts Configuration

### Alert Created — Error Rate Alert

**Signal:** Failed HTTP requests  
**Why:** High signal, clear business impact

- Triggers on elevated error rate
- Uses Application Insights data
- Validates alerting pipeline without alert fatigue

---
## 7. Alerts Intentionally Skipped

The following alerts were **intentionally not created**:

- Latency alert
- AKS health alerts (node/pod restarts)

**Reasoning:**
- Overlapping signal already visible in dashboards
- Marginal operational value for this project
- Recurring cost with limited additional insight

> This decision demonstrates **cost awareness and alert discipline**, which is preferable to alert saturation in real-world systems.

---
## 8. Validation Checklist

All of the following were manually validated:

- Dashboards render correctly
- Queries return data
- Time range picker affects all panels
- Metrics update with live traffic
- Error alert successfully created
- Telemetry aligns with Sprint 5.1 instrumentation

---
## 9. Outcome

At the end of Sprint 5.2, the system has:
- End-to-end observability (traces, metrics, logs)
- Actionable dashboards
- A production-grade alerting example
- Explicit, documented trade-offs

This completes **Phase 5 — Observability & Reliability** from both an engineering and operational perspective.

---
## 10. Next Steps

- Add consolidated **Observability README**
- Add lightweight **Incident Runbook**
- Proceed to **Phase 6** (Final polish, demos, and validation)

---
