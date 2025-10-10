variable "location" {
  type    = string
  default = "eastus2"
}

variable "project_name" {
  type    = string
  default = "ingesoft"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "resource_group_name" {
  type    = string
  default = "rg-ingesoft-dev"
}

variable "vnet_address_space" {
  type    = list(string)
  default = ["10.0.0.0/16"]
}

variable "subnet_address_prefixes" {
  type    = list(string)
  default = ["10.0.1.0/24"]
}

variable "vm_size" {
  type    = string
  default = "Standard_B2ms"
}

variable "admin_username" {
  type    = string
  default = "azureuser"
}

variable "admin_password" {
  type      = string
  sensitive = true
}

variable "allowed_ssh_source_cidrs" {
  description = "CIDRs allowed to SSH into the VM. Use [\"0.0.0.0/0\"] to allow all (not recommended)."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}


