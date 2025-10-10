# Configure the Azure Provider
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.114"
    }
  }
}

provider "azurerm" {
  features {}
}

# Local values
locals {
  common_tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
    created_by  = "student"
  }
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Networking Module
module "networking" {
  source = "../../modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  vnet_address_space  = var.vnet_address_space
  subnet_address_prefixes = var.subnet_address_prefixes
  tags                = local.common_tags
}

# Security Module
module "security" {
  source = "../../modules/security"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = module.networking.subnet_id
  security_rules      = var.security_rules
  tags                = local.common_tags
}

# Compute Module
module "compute" {
  source = "../../modules/compute"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = module.networking.subnet_id
  public_ip_id        = module.networking.public_ip_id
  vm_size             = var.vm_size
  admin_username      = var.admin_username
  admin_password      = var.admin_password
  tags                = local.common_tags
}
