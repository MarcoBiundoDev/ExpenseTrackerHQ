marcobiundo@Mac dev % az aks show --name aks-expensetracker-dev --resource-group rg-expensetracker-network-dev --query identity -o json
{
  "delegatedResources": null,
  "principalId": "ca84eade-5836-4d5c-ba0a-329383f8886a",
  "tenantId": "b9fafe8a-e738-48a9-8685-509c3733e3e6",
  "type": "SystemAssigned",
  "userAssignedIdentities": null
}
marcobiundo@Mac dev % az aks show \                                                                                                    
  --name aks-expensetracker-dev \
  --resource-group rg-expensetracker-network-dev \
  --query "{type:identity.type, principalId:identity.principalId, tenantId:identity.tenantId}" -o table
PrincipalId                           TenantId
------------------------------------  ------------------------------------
ca84eade-5836-4d5c-ba0a-329383f8886a  b9fafe8a-e738-48a9-8685-509c3733e3e6