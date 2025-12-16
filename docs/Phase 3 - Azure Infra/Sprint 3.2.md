# Sprint 3.2 — AKS, ACR, Node Pools & Permissions (Senior-Level Deep Dive)

> This document is intentionally verbose.
> The goal is not speed — the goal is **understanding**.
> You should be able to:
> - rebuild Sprint 3.2 from scratch
> - explain every command without memorization
> - reason your way to the correct solution if something breaks

---

## Sprint Objective (Why This Sprint Exists)
Sprint 3.2 establishes a **production‑grade Kubernetes foundation** on Azure using Infrastructure as Code (Terraform). The goal is not just “get AKS running”, but to:

- Build AKS the way **real platform teams do**
- Avoid anti‑patterns (secrets, admin users, flat node pools)
- Control cost intentionally
- Understand *why* every decision was made

---

## Mental Model Before Any Commands
Before touching Azure or Terraform, it is critical to understand:

- **AKS control plane** is managed by Azure (you do not pay for it)
- **Worker nodes** are Azure VMs (this is what costs money)
- **ACR authentication** is an identity problem, not a Docker problem
- **Kubernetes networking** is layered on top of Azure networking

If you do not understand these points, the commands will feel like magic.
This document removes the magic.

---

# Task 1 — Create AKS Cluster

## Terraform Resource: azurerm_kubernetes_cluster

```hcl
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_name
  location            = var.location
  resource_group_name = var.rg_name
  dns_prefix          = var.dns_prefix
}
```

### How to Reason About This
- This resource creates **one Azure resource**: AKS
- Everything else (node pools, identities, networking) hangs off this

Each argument answers a specific Azure question:
- *What is this called?*
- *Where does it live?*
- *Who owns it (billing + lifecycle)?*

---

## Managed Identity

```hcl
identity {
  type = "SystemAssigned"
}
```

### What This Actually Does
- Azure creates an identity in Entra ID
- The identity lifecycle is tied to AKS
- The identity can be granted Azure roles (RBAC)

### Why This Matters Later
This identity is reused for:
- pulling images from ACR
- accessing other Azure resources securely

---

## Networking: Azure CNI

```hcl
network_profile {
  network_plugin = "azure"
  service_cidr   = "10.1.0.0/16"
  dns_service_ip = "10.1.0.10"
}
```

### How to Reason About These Fields
- `network_plugin = "azure"`
  - Pods get real IPs from your VNet
  - Required for private endpoints later

- `service_cidr`
  - Virtual IP range for **Kubernetes Services**
  - Must not overlap with your VNet

- `dns_service_ip`
  - One IP inside the service CIDR
  - Used by CoreDNS

### Real Failure We Hit
AKS failed to create because:
- VNet CIDR: `10.0.0.0/16`
- Default service CIDR overlapped

This teaches a core rule:
> Kubernetes networking **must be planned**, not guessed.

---

## System Node Pool

```hcl
default_node_pool {
  name       = "system"
  node_count = 1
  vm_size    = "Standard_DS2_v2"
  mode       = "System"
  enable_auto_scaling = false
}
```

### How to Reason About This
- AKS **requires** a system pool
- This pool runs:
  - kube-system pods
  - CNI agents
  - CSI drivers

Why autoscaling is disabled:
- These workloads are stable
- Scaling adds cost without benefit in dev

---

## Verifying AKS Creation (Azure Perspective)

```bash
az aks show \
  -g rg-expensetracker-network-dev \
  -n aks-expensetracker-dev \
  --query provisioningState
```

### How to Recreate This Command From Memory

Start with the question:
> “What is the state of my AKS resource?”

Then map that to Azure CLI concepts:

- `az aks show`
  - “Show me details about an AKS cluster”

- `-g`
  - Short for `--resource-group`
  - Azure resources always live inside a resource group

- `-n`
  - Short for `--name`
  - AKS cluster name

- `--query provisioningState`
  - JMESPath query to extract one field
  - Prevents noisy output

Expected output:
```
Succeeded
```

---

## Getting Kubernetes Credentials

```bash
az aks get-credentials \
  -g rg-expensetracker-network-dev \
  -n aks-expensetracker-dev \
  --overwrite-existing
```

### Mental Model
This command does **not** talk to Kubernetes.
It talks to **Azure**, asks for cluster credentials, and writes them into:

```
~/.kube/config
```

### Flag Breakdown
- `get-credentials`
  - Fetch kubeconfig for a cluster

- `--overwrite-existing`
  - Replace any existing context with the same name
  - Prevents stale credentials

---

## Verifying Nodes

```bash
kubectl get nodes -o wide
```

### How to Reason About This
- `kubectl` talks to the Kubernetes API
- `get nodes` asks the control plane which nodes are registered
- `-o wide` adds:
  - internal IP
  - OS
  - container runtime

What this proves:
- Networking works
- Node joined successfully
- Azure CNI assigned an IP from the subnet

---

# Task 2 — Node Pools & Cost Control

## Why Node Pools Exist
Node pools are:
- Azure VM Scale Sets
- Managed by AKS
- Independently scalable

This allows:
- separating system workloads
- scaling app workloads independently
- controlling cost

---

## User Node Pool (Terraform)

```hcl
resource "azurerm_kubernetes_cluster_node_pool" "user" {
  name                  = "user"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  vm_size               = "Standard_B2s"
  mode                  = "User"

  enable_auto_scaling = true
  min_count           = 0
  max_count           = 2
}
```

### Line-by-Line Reasoning
- `kubernetes_cluster_id`
  - Tells Azure *which* AKS cluster this pool belongs to

- `mode = "User"`
  - Marks this pool for application workloads

- `min_count = 0`
  - Critical cost control decision
  - Allows zero running VMs

- `max_count = 2`
  - Enough to demo multi-node behavior

---

## Scaling the User Pool (Manual Control)

```bash
az aks nodepool scale \
  -g rg-expensetracker-network-dev \
  --cluster-name aks-expensetracker-dev \
  -n user \
  --node-count 0
```

### How to Rebuild This Command From First Principles

Start with the intent:
> “Change the number of nodes in a specific node pool”

Then map intent to CLI structure:

- `az aks nodepool scale`
  - AKS → node pool → scale operation

- `-g`
  - Resource group containing AKS

- `--cluster-name`
  - AKS cluster name (node pools belong to a cluster)

- `-n`
  - Node pool name (`user`)

- `--node-count`
  - Desired number of nodes

This command directly controls **cost**.

---

# Task 3 — AKS → ACR Permissions

## The Real Problem Being Solved
> “How does a Kubernetes node authenticate to a private container registry?”

This is **not** a Docker problem.
It is an **identity + authorization** problem.

---

## Terraform Role Assignment

```hcl
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = module.acr.acr_id
  role_definition_name = "AcrPull"
  principal_id         = module.aks.kubelet_object_id
}
```

### How to Reason About This Resource
Every Azure permission answers three questions:

1. **Who?**
   - `principal_id` → AKS kubelet identity

2. **What can they do?**
   - `AcrPull` → pull images only

3. **Where?**
   - `scope` → only this ACR

This is least privilege by design.

---

## Proving It Works — Image Pull Test

### Why a Test Deployment Exists
Terraform cannot prove runtime behavior.
Kubernetes must pull an image to prove auth works.

---

## Apple Silicon Platform Issue

```bash
docker buildx build \
  --platform linux/amd64 \
  -t acrexptrackerhqdev01.azurecr.io/expense-api:dev \
  --push
```

### How to Reason About This Command
- `buildx`
  - Multi-platform Docker builder

- `--platform linux/amd64`
  - Matches AKS node architecture

- `-t`
  - Fully qualified image name (registry/repo:tag)

- `--push`
  - Required because buildx does not load locally by default

---

## Verifying No Secrets Were Used

```bash
kubectl get pod -l app=acr-pull-test \
  -o jsonpath='{.items[0].spec.imagePullSecrets}'
```

### Why This Matters
If this returns empty:
- No Kubernetes secret
- No Docker creds
- Managed Identity worked

This is the strongest proof possible.

---

# Cost Control Summary (Mental Model)

## What Costs Money
- Running VMs (node pools)
- LoadBalancers
- Private Endpoints
- Azure SQL compute

## What Is Free
- VNets
- Subnets
- NSGs
- RBAC assignments
- Managed identities

---

## Sprint 3.2 Outcome
You now understand:
- How AKS actually works
- How Azure networking integrates with Kubernetes
- How identity replaces secrets
- How cost is controlled intentionally

---

## Sprint 3.2 Status
✅ **Complete**

Next:
**Sprint 3.3 — Deploy API to AKS using Helm**
