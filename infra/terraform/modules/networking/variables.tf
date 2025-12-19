variable "rg_name" { type = string }
variable "location" { type = string }
variable "vnet_name" { type = string }
variable "vnet_cidr" { type = string }
variable "aks_subnet_name" { type = string }
variable "aks_subnet_cidr" { type = string }
variable "sql_subnet_name" { type = string }
variable "sql_subnet_cidr" { type = string }
variable "aks_nsg_name" { type = string }
variable "sql_nsg_name" { type = string }
variable "nodeport_range" {
  type    = list(string)
  default = ["30000-32767"]
}

variable "nodeport_rule_priority" {
  type    = number
  default = 180
}

variable "allowed_source_prefix" {
  type    = string
  default = "Internet"
}
