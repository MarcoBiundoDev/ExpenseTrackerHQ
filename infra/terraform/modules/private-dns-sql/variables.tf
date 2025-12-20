variable "dns_zone_name" {
  type    = string
  default = "privatelink.database.windows.net"
}
variable "rg_name" { type = string }
variable "vnet_id" { type = string }
variable "location" { type = string }

variable "tags" {
  type    = map(string)
  default = {}

}
