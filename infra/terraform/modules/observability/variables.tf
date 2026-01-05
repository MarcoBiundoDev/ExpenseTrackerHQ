variable "env" {
  type = string
}

variable "location" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "log_analytics_retention_days" {
  type    = number
  default = 30
}

variable "name_prefix" {
  type    = string
  default = null
}

variable "log_analytics_name" {
  type    = string
  default = null
}


variable "application_insights_name" {
  type    = string
  default = null
}

variable "rg_name" {
  type = string
}

variable "aks_id" {
  type = string
}
