terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate-dev"
    storage_account_name = "tfstateexpensetracker"
    container_name       = "tfstate"
    key                  = "dev/phase3.tfstate"
  }
}
