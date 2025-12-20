variable "sql_server_name" {
  type = string
}
variable "rg_name" {
  type = string
}
variable "location" {
  type = string
}
variable "admin_login" {
  type = string
}
variable "admin_password" {
  type = string
}
variable "sql_db_name" {
  type = string
}
variable "tags" {
  type    = map(string)
  default = {}
}
