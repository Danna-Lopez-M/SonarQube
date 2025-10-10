# Production Environment Configuration
project_name        = "ingesoft"
environment         = "prod"
location            = "eastus2"
resource_group_name = "rg-ingesoft-prod"
vm_size             = "Standard_B2s"  # Larger VM for production
admin_username      = "azureuser"

# IMPORTANT: Set your admin password using environment variable or terraform.tfvars.local
# admin_password = "YourVerySecurePassword123!"

# Network Configuration
vnet_address_space       = ["10.1.0.0/16"]
subnet_address_prefixes  = ["10.1.1.0/24"]

# Security Rules (More restrictive for production)
security_rules = [
  {
    name                       = "allow-ssh-restricted"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefixes    = ["YOUR_OFFICE_IP/32"]  # Replace with your actual IP
    destination_address_prefix = "*"
  }
]
