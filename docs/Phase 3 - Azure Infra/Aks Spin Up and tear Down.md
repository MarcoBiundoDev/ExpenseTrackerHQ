## Aks Dev Spin-Up
### 1) Start the Aks Cluster

```bash
az aks start \
  -g rg-expensetracker-network-dev \
  -n aks-expensetracker-dev
```

### 2) Make sure kubectl is pointing at aks (not minikube)
```bash
kubectl config use-context aks-expensetracker-dev
kubectl config current context 
```

### 3) Confirm  nodes are back
```bash
kubectl get nodes
kubectl get nodes --show-labels
```


## Aks Dev Tear-Down
### 1) Make sure user pool can go back to 0

```bash
az aks nodepool update \
-g rg-expensetracker-network-dev
--cluster-name aks-expensetracker-dev \
-n user \
--min count 0 \
max count 2 \
--enable-cluster-autoscaler
```

### 2) Stop Aks
```bash
az aks stop \
-g rg-expensetracker-network-dev \
-n aks-expensetracker-dev
```


