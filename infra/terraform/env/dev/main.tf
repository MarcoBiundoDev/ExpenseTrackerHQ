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
