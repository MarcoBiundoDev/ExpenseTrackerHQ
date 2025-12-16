module "networking" {
  source = "../../modules/networking"

  rg_name  = "rg-expensetracker-network-dev"
  location = "canadacentral"

  vnet_name = "vnet-expensetracker-dev"
  vnet_cidr = "10.0.0.0/16"

  aks_subnet_name = "snet-aks"
  aks_subnet_cidr = "10.0.1.0/24"

  sql_subnet_name = "snet-sql"
  sql_subnet_cidr = "10.0.2.0/24"
  aks_nsg_name    = "nsg-expensetracker-aks-dev"
  sql_nsg_name    = "nsg-expensetracker-sql-dev"
}

module "acr" {
  source   = "../../modules/acr"
  rg_name  = module.networking.rg_name
  location = module.networking.location
  acr_name = "acrexptrackerhqdev01"
  sku      = "Basic"
  tags = {
    project = "ExpenseTrackerHQ"
    env     = "dev"
  }
}

module "aks" {
  source              = "../../modules/aks"
  rg_name             = module.networking.rg_name
  location            = module.networking.location
  aks_name            = "aks-expensetracker-dev"
  dns_prefix          = "aks-expense-dev"
  subnet_id           = module.networking.aks_subnet_id.id
  kubernetes_version  = null
  system_node_count   = 1
  system_node_max     = 3
  system_node_min     = 1
  system_node_vm_size = "Standard_D2_v3"
  service_cidr        = "10.1.0.0/16"
  dns_service_ip      = "10.1.0.10"
  user_node_vm_size   = "Standard_D2_v3"
  user_node_min       = 0
  user_node_max       = 2

  tags = {
    project = "ExpenseTrackerHQ"
    env     = "dev"
  }
}
