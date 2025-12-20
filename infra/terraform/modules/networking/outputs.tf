output "vnet_id" { value = azurerm_virtual_network.vnet.id }
output "aks_subnet_id" { value = azurerm_subnet.aks.id }
output "sql_subnet_id" { value = azurerm_subnet.sql.id }
output "rg_name" { value = azurerm_resource_group.network.name }
output "location" { value = azurerm_resource_group.network.location }
output "aks_nsg_id" { value = azurerm_network_security_group.aks.id }
output "sql_nsg_id" { value = azurerm_network_security_group.sql.id }

