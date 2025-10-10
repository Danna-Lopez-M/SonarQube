# Development Environment Configuration
project_name        = "ingesoft"
environment         = "dev"
location            = "eastus2"
resource_group_name = "rg-ingesoft-dev"
vm_size             = "Standard_B2ms"
admin_username      = "azureuser"

# IMPORTANT: Set your admin password using environment variable or terraform.tfvars.local
# admin_password = "YourSecurePassword123!"

# Network Configuration
vnet_address_space       = ["10.0.0.0/16"]
subnet_address_prefixes  = ["10.0.1.0/24"]

# Security Rules (SSH access from anywhere - adjust for production)
security_rules = [
  {
    name                       = "allow-ssh"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefixes    = ["0.0.0.0/0"]
    destination_address_prefix = "*"
  },
  {
    name                       = "allow-sonarqube"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "9000"
    source_address_prefixes    = ["0.0.0.0/0"]
    destination_address_prefix = "*"
  }
]
