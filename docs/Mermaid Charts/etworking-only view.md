```mermaid
flowchart LR
  %% ===== Developer machine path (dev convenience) =====
  DEV[Comp] -->|DNS expense.local to ingress IP| DNS_LOCAL[Local DNS or hosts]
  DNS_LOCAL -->|A record to ingress service IP| INGRESS_SVC[Ingress Service LB]
  INGRESS_SVC -->|Host expense.local| INGRESS[Ingress Controller]
  INGRESS --> API[Expense API Pod]

  %% ===== Azure private SQL path (real network plumbing) =====
  subgraph AZ["Azure Subscription"]
    subgraph VNET["VNet (Phase 3)"]
      AKS_SUBNET[AKS Subnet]
      PE_SUBNET[Private Endpoints Subnet]
      DNS_ZONE["Private DNS Zone<br/>privatelink.database.windows.net"]
    end

    SQL_FQDN["SQL Server FQDN<br/>sql-...database.windows.net"]
    SQL[(Azure SQL)]
    SQL_PE[(Private Endpoint for Azure SQL)]
  end

  %% Pod -> SQL resolution + routing
  API -->|lookup SQL FQDN| DNS_ZONE
  DNS_ZONE -->|returns private IP| API
  API -->|TCP 1433 to private IP| SQL_PE
  SQL_PE --> SQL
  SQL_PE --> PE_SUBNET
  API --> AKS_SUBNET

  %% DNS zone linkage
  DNS_ZONE ---|linked to VNet| VNET
  SQL_FQDN --- DNS_ZONE
  ```
