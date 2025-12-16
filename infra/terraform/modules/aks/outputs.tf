output "aks_id" {
  value = azurerm_kubernetes_cluster.aks.id
}

output "aks_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "aks_rg_name" {
  value = azurerm_kubernetes_cluster.aks.resource_group_name
}
output "aks_resource_group" {
  value = azurerm_kubernetes_cluster.aks.node_resource_group
}

output "kubelet_object_id" {
  value = try(azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id, null)
}
