# Sprint 3.3 — Helm + Ingress on AKS (Public Access)

> **Scope note (important):** This document intentionally **excludes** the earlier “first attempt” ingress run where we went too fast and later decided to backtrack. It documents the **clean restart** (after backtracking) and everything we did from that point onward.
>
> **Goal of Sprint 3.3:**
> - Deploy the Expense API to AKS using Helm.
> - Verify pods/services are healthy.
> - Add a real ingress (NGINX) with a public IP.
> - Validate the API is reachable from the public internet.
> - Keep the setup cost-aware.

---

## Outcomes

By the end of this sprint we achieved:

- ✅ `expense-api` deployed to **AKS** via **Helm** in namespace `expense-dev`.
- ✅ API reachable internally (cluster networking) and via port-forward.
- ✅ **ingress-nginx** installed and exposed via an Azure **LoadBalancer** with a public IP.
- ✅ Ingress routes correctly to the API (including Swagger) when the **Host header** matches.
- ✅ We fixed the “can’t reach public IP” issue by addressing:
  - Azure LB health probe behavior (`/healthz`) for ingress-nginx
  - NSG inbound rules for NodePorts and public HTTP/HTTPS
  - A local **/etc/hosts** override that was hijacking browser testing
- ✅ We returned NSG rules to the known-good state via **Terraform** reconciliation.

---

## Architecture we built (mental model)

### Public request flow

When a user hits your API over the internet, the traffic path is:

1. **Client (browser/curl)**
2. **Azure Public IP** attached to the AKS-managed **Load Balancer**
3. **Azure Load Balancer** forwards traffic to nodes via **NodePort**
4. **ingress-nginx controller** receives the request
5. Ingress rules route the request to the Kubernetes **Service**
6. Service routes the request to the API **Pod**

In short:

> **Internet → Public IP → Azure LB → NodePort → NGINX Ingress → Service → Pod**

This is why (in our environment) **NodePort reachability and LB health probes** mattered.

---

## Step 1 — Confirm baseline: Helm deploy on AKS (no public ingress yet)

### Namespace
We use a dedicated namespace for the dev environment:

- **Namespace:** `expense-dev`

If it doesn’t exist, create it:

```bash
kubectl create namespace expense-dev
```

**Command breakdown:**
- `kubectl` = Kubernetes CLI
- `create namespace` = creates an isolated logical space for resources
- `expense-dev` = namespace name

---

### Helm install/upgrade (Expense API)

From the directory containing your chart (where `Chart.yaml` lives), we deploy using:

```bash
helm upgrade --install expense-api . \
  -n expense-dev \
  --create-namespace
```

**Command breakdown:**
- `helm` = package manager for Kubernetes
- `upgrade --install` = “idempotent deploy”:
  - upgrades if the release exists
  - installs if it doesn’t
- `expense-api` = Helm release name (Helm’s identity for this deployment)
- `.` = chart path (current directory)
- `-n expense-dev` = target namespace
- `--create-namespace` = create namespace if missing (safe even if it exists)

---

### Why `helm upgrade --install` is “professional”

This is the standard approach because:
- You can run it repeatedly without worrying about whether it’s install vs update.
- It’s the easiest way to apply configuration changes and keep resources consistent.

---

## Step 2 — Fix a Helm ownership conflict (Ingress resource)

### What happened
We ran Helm and got an error like:

> An Ingress named `expense-api` already exists, but it is not owned by this Helm release.

This happens when:
- An ingress resource exists from a previous manual apply (`kubectl apply`) or another release.
- Helm refuses to take ownership because Helm tracks resources using labels/annotations.

### The fix we chose (Option A)
We deleted the existing ingress and let Helm recreate it:

```bash
kubectl delete ingress expense-api -n expense-dev
```

**Command breakdown:**
- `kubectl delete` = remove a resource
- `ingress` = the resource type
- `expense-api` = the resource name
- `-n expense-dev` = the namespace where it lives

Then we re-ran Helm:

```bash
helm upgrade --install expense-api . -n expense-dev
```

### Why this is the cleanest solution
- Keeps “single source of truth” through Helm (no “mystery YAML” outside Helm).
- Ensures future `helm upgrade` and rollbacks work reliably.

---

## Step 3 — Prepare the API for health probes

### Why we changed probes
Kubernetes uses probes to determine:
- **Readiness:** should this pod receive traffic?
- **Liveness:** should Kubernetes restart this pod?

If you probe a path that returns 404 (like `/` on many APIs), the pod can be marked unready and traffic routing becomes unreliable.

### What we changed
In your Helm values (for the `expense-api` chart), we updated probes from `/` to `/health`:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
readinessProbe:
  httpGet:
    path: /health
    port: http
```

**Line-by-line explanation:**
- `livenessProbe` = “is the app alive?” (if failing repeatedly, kube restarts pod)
- `readinessProbe` = “is the app ready?” (if failing, pod is removed from service endpoints)
- `httpGet` = perform HTTP request
- `path: /health` = endpoint expected to return `200 OK`
- `port: http` = uses the named container port (from the deployment template)

---

## Step 4 — Install NGINX Ingress Controller (AKS)

### Why ingress-nginx
We use ingress-nginx because:
- It’s the standard Kubernetes ingress controller.
- It supports host/path routing.
- It integrates well with AKS and Azure Load Balancers.

### Installation (Helm)

Typical install flow:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx \
  --create-namespace
```

**Command breakdown:**
- `helm repo add` = add a chart repository
- `helm repo update` = fetch latest chart index
- `upgrade --install` = idempotent deployment of ingress-nginx
- `ingress-nginx` (release name) = the name Helm will use to manage it
- `ingress-nginx/ingress-nginx` = chart reference
- `-n ingress-nginx` = dedicated namespace for ingress components

### Confirm service created and got an external IP

```bash
kubectl get svc -n ingress-nginx
```

What we look for:
- `ingress-nginx-controller` Service
- `TYPE: LoadBalancer`
- An `EXTERNAL-IP` value

---

## Step 5 — Create (or re-enable) API Ingress routing

### Why we use a Hostname (e.g., `expense.local`)
Ingress often routes based on a “Host”:
- In production: `api.yourdomain.com`
- In dev/demo: `expense.local`

This allows multiple apps behind a single load balancer IP.

### Testing implication
If the Ingress rule expects `expense.local`, then:
- Request with Host = `expense.local` routes properly
- Request with Host = raw IP routes to default backend (404)

This distinction becomes crucial for debugging.

---

## Step 6 — Debugging: “Public IP times out”

At this point we saw:
- We had an external IP
- But **curl to the public IP timed out** (even from phone LTE)

That means it’s not just a local network problem.

### 6.1 Validate whether the Load Balancer is reachable at all

We tested basic TCP connectivity:

```bash
nc -vz <PUBLIC_IP> 80
```

**Command breakdown:**
- `nc` = netcat
- `-v` = verbose output
- `-z` = “scan mode” (don’t send data)
- `<PUBLIC_IP> 80` = attempt TCP connection to port 80

If this times out, it strongly suggests:
- LB backend is unhealthy
- NSG is blocking inbound
- the service is misconfigured

---

## Step 7 — Why `/healthz` mattered (Azure LB probe vs your API health)

This sprint had two different “health” concepts:

### A) Azure Load Balancer probe (ingress-nginx infrastructure)
Azure must decide whether the backend is “healthy” to forward internet traffic. If the probe is failing, the public IP can time out.

We configured the ingress-nginx service annotation so Azure probes a known endpoint:

- **LB probe path:** `/healthz`

This is an **ingress controller** health endpoint, not your API.

### B) Your API `/health` endpoint
This is your application’s health endpoint used for:
- Kubernetes readiness/liveness
- confirming routing to the API is working

**Key takeaway:**
- `/healthz` helps **Azure LB → ingress-nginx**
- `/health` helps **Kubernetes → your API**

---

## Step 8 — Validate that ingress is routing correctly (Host header)

Once we had a reachable public IP, we saw nginx respond with `404` when hitting the raw IP. That’s normal with host-based routing.

### Correct test using Host header

```bash
curl -i -H "Host: expense.local" http://<PUBLIC_IP>/health
curl -i -H "Host: expense.local" http://<PUBLIC_IP>/swagger/index.html
```

**Command breakdown:**
- `curl` = HTTP client
- `-i` = include response headers in output
- `-H "Host: expense.local"` = send an HTTP header that matches the ingress host rule
- `http://<PUBLIC_IP>/...` = hit the load balancer public IP

When these returned **200**, it proved:
- public IP works
- ingress-nginx works
- ingress routes to the API service
- API pod responds correctly

---

## Step 9 — Browser confusion: the real culprit was `/etc/hosts`

### Symptom
We could get `200` from curl (with Host header), but opening `http://expense.local/...` in a browser didn’t behave as expected.

### Root cause
A previous minikube setup had:

```text
127.0.0.1 expense.local
```

This caused:
- the browser to resolve `expense.local` to localhost
- not to AKS

So the browser was *never actually reaching Azure*.

### Fix
We updated `/etc/hosts` so `expense.local` points to the AKS public IP, and removed/commented the localhost mapping.

Example:

```text
# 127.0.0.1 expense.local
4.229.153.138 expense.local
```

Then we flushed DNS cache (macOS):

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Command breakdown:**
- `sudo` = run as admin
- `dscacheutil -flushcache` = flush directory services caches
- `killall -HUP mDNSResponder` = restart/refresh local DNS responder

After that, the browser correctly loaded:

- `http://expense.local/swagger/index.html`

---

## Step 10 — NSG rules: what we added, what we removed, and why it broke

This was the most confusing part of the night, so here is the clean, correct summary.

### The key insight
In our setup, the ingress controller is exposed via an Azure LoadBalancer that forwards to nodes using **NodePorts** (the service had NodePorts like `30595` and `31501`).

If the NSG blocks those NodePorts, public traffic can fail.

### What happened
1. We had a working state.
2. We attempted a “least privilege” cleanup by deleting rules:
   - `Internet → 30000–32767`
   - `Internet → 80/443`
3. After deleting them, ingress stopped working.

### Why that happened
In *your* current network posture, the subnet NSG rules you had in Terraform were part of the working flow. Removing them blocked inbound traffic needed for this environment.

### How we fixed it (the professional approach)
Instead of re-adding rules manually in the portal, we:
- deleted the incorrect new rules
- ran **Terraform apply**
- Terraform reconciled the NSG back to the known-good state

This is the exact kind of “senior” behavior you want:
- treat Terraform as the source of truth
- let it restore the correct configuration

### What NSG rules we keep (for now)
We keep the rules Terraform defines because:
- they are proven to work
- they are repeatable
- they prevent “portal drift”

**Future improvement (optional):**
When we have time, we can tighten rules to only the specific NodePorts used by ingress rather than the full 30000–32767 range.

---

## Step 11 — Cost awareness notes (Sprint 3.3)

Ingress creates Azure resources that may incur cost:
- Public IP resource
- Load Balancer resource
- Running AKS node(s)

### The main cost driver
AKS node VM(s) are the biggest cost driver. Load balancer and public IP are usually smaller but not always zero.

### Cost control approach we used
- Keep cluster small
- Use start/stop for AKS when not actively working (where supported)
- Don’t leave extra node pools running unnecessarily

---

## Final verification checklist (copy/paste)

### Kubernetes resources

```bash
kubectl get ns
kubectl get pods -n expense-dev
kubectl get svc -n expense-dev
kubectl get ingress -n expense-dev

kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

### Public IP reachability

```bash
nc -vz <PUBLIC_IP> 80
curl -i http://<PUBLIC_IP>/
```

### Ingress routing (Host-based)

```bash
curl -i -H "Host: expense.local" http://<PUBLIC_IP>/health
curl -i -H "Host: expense.local" http://<PUBLIC_IP>/swagger/index.html
```

### Browser

- Ensure `/etc/hosts` maps `expense.local` → `<PUBLIC_IP>`
- Open:
  - `http://expense.local/swagger/index.html`

---

## Key lessons learned

1. **Host-based ingress** means raw-IP requests can return 404 even when everything works.
2. You can prove routing by setting the `Host` header manually with curl.
3. Azure LB health probes are infrastructure-level; app health endpoints are application-level.
4. `/etc/hosts` overrides can completely mislead browser testing.
5. When NSG rules drift, **Terraform should be the source of truth**.
6. “Fixing it yourself” by returning to Terraform’s known-good state is exactly the right move.

---

## Next sprint preview (Phase 3.4-ish)

Now that ingress works, the next logical infra steps are:
- Azure SQL (and likely Private Endpoint + Private DNS)
- App configuration to use Azure SQL connection
- Secrets management (Key Vault or Kubernetes secrets, depending on phase plan)

---
