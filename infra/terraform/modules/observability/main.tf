locals {
  name_prefix = coalesce(var.name_prefix, "expensetracker-${var.env}")
  law_name    = coalesce(var.log_analytics_name, "law-${local.name_prefix}")
  ai_name     = coalesce(var.application_insights_name, "ai-${local.name_prefix}")
}

resource "azurerm_resource_group" "observability" {

  name     = var.rg_name
  location = var.location
  tags     = var.tags
}


resource "azurerm_log_analytics_workspace" "law" {
  name                = local.law_name
  location            = var.location
  resource_group_name = azurerm_resource_group.observability.name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_analytics_retention_days
  tags                = var.tags
}

resource "azurerm_application_insights" "ai" {
  name                = local.ai_name
  location            = var.location
  resource_group_name = azurerm_resource_group.observability.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.law.id
  tags                = var.tags
}

resource "azurerm_monitor_data_collection_rule" "aks_containerinsights" {
  name                = "dcr-aks-containerinsights-${var.env}"
  location            = var.location
  resource_group_name = azurerm_resource_group.observability.name

  destinations {
    log_analytics {
      workspace_resource_id = azurerm_log_analytics_workspace.law.id
      name                  = "lawdest"
    }
  }

  data_flow {
    streams      = ["Microsoft-ContainerInsights-Group-Default"]
    destinations = ["lawdest"]
  }

  data_sources {
    extension {
      name           = "ContainerInsights"
      extension_name = "ContainerInsights"
      streams        = ["Microsoft-ContainerInsights-Group-Default"]
    }
  }
}

resource "azurerm_monitor_data_collection_rule_association" "aks_containerinsights_assoc" {
  name                    = "dcra-aks-containerinsights-${var.env}"
  target_resource_id      = var.aks_id
  data_collection_rule_id = azurerm_monitor_data_collection_rule.aks_containerinsights.id
}
