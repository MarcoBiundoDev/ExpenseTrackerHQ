# Incident Runbook — ExpenseTrackerHQ

This runbook provides **practical, first-response guidance** for handling common incidents in the ExpenseTrackerHQ system.

It is intentionally **short, opinionated, and high-signal**.  
The goal is to restore confidence and direction during an incident — not to document every possible failure.

---
## 1. Purpose of This Runbook

This runbook exists to answer three questions quickly during an incident:

1. What symptom am I seeing?
2. Where should I look first?
3. Is this an application issue or an infrastructure issue?

It assumes:
- Observability (traces, metrics, logs) is already in place
- Dashboards and alerts are available
- The system is running on AKS with Azure Monitor enabled

---
## 2. First Response Checklist (Always Start Here)

When alerted or when an issue is suspected:

1. **Do not restart anything immediately**
2. Check the **Observability Dashboard**
3. Identify which signal is abnormal:
   - Errors
   - Latency
   - Traffic
   - Resource pressure
4. Determine scope:
   - One endpoint?
   - One pod?
   - Entire service?

Only take action once the scope is understood.

---
## 3. High Error Rate Alert Triggered

### Symptoms
- Error rate alert fired
- Elevated failed requests in dashboards
- HTTP 4xx / 5xx responses

### Where to Look
1. Application dashboard → Error Rate panel
2. Application Insights → `requests` table
3. Drill into a failing `operation_Id`
4. Follow the trace across dependencies

### KQL Starting Point
```kql
requests
| where success == false
| order by timestamp desc
```

### Likely Causes
- Unhandled exceptions in command/query handlers
- Downstream dependency failures (SQL, HTTP)
- Invalid input or contract mismatch

### Next Actions
- Inspect correlated logs for context
- Verify dependency health
- Roll back recent deployment **only if** errors correlate with release time

---
## 4. Increased Latency (No Alert)

> Latency does not trigger an alert by design. It is investigated via dashboards.

### Symptoms
- Slow responses
- Increased p95 latency in dashboards
- User-reported slowness

### Where to Look
1. Application dashboard → Latency panels
2. Top Slow Endpoints panel
3. Dependency latency panel

### KQL Starting Point
```kql
requests
| summarize avg(duration) by name
| order by avg_duration desc
```

### Likely Causes
- Slow database queries
- Increased load
- Resource contention at the pod or node level

### Next Actions
- Inspect dependency spans in traces
- Check AKS CPU/memory dashboards
- Confirm pod replica count is sufficient

---
## 5. Traffic Drop or Spike

### Symptoms
- Sudden drop to zero requests
- Unexpected traffic surge

### Where to Look
1. Request Rate panel
2. API Gateway / ingress logs (if applicable)
3. Deployment status in AKS

### Likely Causes
- Client-side outage
- Networking or ingress issue
- Deployment in progress or failed rollout

### Next Actions
- Confirm pods are running and ready
- Check recent Helm deployments
- Validate ingress and service endpoints

---
## 6. AKS Resource Pressure

### Symptoms
- Pods restarting
- Increased memory or CPU usage
- Degraded performance without errors

### Where to Look
1. AKS dashboard → CPU & memory panels
2. Pod restart metrics
3. Kubernetes events

### Likely Causes
- Insufficient resource requests/limits
- Noisy neighbor pods
- Node-level contention

### Next Actions
- Identify affected pods
- Compare resource usage vs limits
- Scale replicas if necessary

---
## 7. No Telemetry Appearing

### Symptoms
- Dashboards empty
- No recent traces or metrics
- Alerts silent during known activity

### Where to Look
1. Application Insights → Live Metrics
2. Log Analytics Workspace → recent tables
3. Deployment status of the API

### Likely Causes
- Application not receiving traffic
- Telemetry exporter misconfiguration
- Deployment failed or pod crash loops

### Next Actions
- Confirm pods are running
- Verify Application Insights connection string is present
- Check recent deployment logs

---
## 8. Deployment-Related Issues

### Symptoms
- Issues immediately after deployment
- Partial rollout
- CrashLoopBackOff

### Where to Look
1. AKS → Workloads → Pods
2. Pod logs
3. Rollout status

### Next Actions
- Compare current image tag with previous known-good
- Roll back only if failure is clearly deployment-related
- Avoid repeated restarts without diagnosis

---
## 9. General Principles

- Prefer **observability over guesswork**
- Avoid alert fatigue
- Fix root causes, not symptoms
- Document lessons learned after incidents

---
## 10. Scope & Limitations

This runbook is intentionally limited to:
- First response
- Diagnosis guidance
- Safe next actions

It does not replace:
- Long-term SRE playbooks
- Capacity planning
- SLA/SLO management

---
## 11. Summary

This runbook demonstrates:
- Operational awareness
- Clear thinking under failure
- Practical use of observability signals

It is designed to scale with the system as complexity grows.

---
