variable "rg_name" {
  type = string
}
variable "location" {
  type = string
}
variable "aks_name" {
  type = string
}
variable "dns_prefix" {
  type = string
}
variable "subnet_id" {
  type = string
}
variable "kubernetes_version" {
  type    = string
  default = null
}
variable "system_node_vm_size" {
  type    = string
  default = "Standard_B2s"
}
variable "system_node_count" {
  type    = number
  default = "1"
}
variable "system_node_min" {
  type    = number
  default = "1"
}
variable "system_node_max" {
  type    = number
  default = "3"
}
variable "tags" {
  type    = map(string)
  default = {}
}
variable "service_cidr" {
  type    = string
  default = "10.1.0.0./16"
}

variable "dns_service_ip" {
  type    = string
  default = "10.1.0.10"
}
variable "user_node_vm_size" {
  type    = string
  default = "Standard_B2s"
}

variable "user_node_min" {
  type    = number
  default = 0
}

variable "user_node_max" {
  type    = number
  default = 2
}
