output "rg_name" {
  value = azurerm_resource_group.observability.name
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.law.id
}

output "log_analytics_workspace_name" {
  value = azurerm_log_analytics_workspace.law.name
}

output "application_insights_id" {
  value = azurerm_application_insights.ai.id
}

output "application_insights_name" {
  value = azurerm_application_insights.ai.name
}

output "application_insights_connection_string" {
  value     = azurerm_application_insights.ai.connection_string
  sensitive = true
}

output "application_insights_instrumentation_key" {
  value     = azurerm_application_insights.ai.instrumentation_key
  sensitive = true
}
