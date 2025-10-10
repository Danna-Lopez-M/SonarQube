# Network Interface
resource "azurerm_network_interface" "nic" {
  name                = "nic-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = var.public_ip_id
  }
  tags = var.tags
}

# Virtual Machine
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "vm-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.vm_size

  network_interface_ids = [
    azurerm_network_interface.nic.id,
  ]

  admin_username = var.admin_username
  admin_password = var.admin_password

  disable_password_authentication = false
  
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = var.image_publisher
    offer     = var.image_offer
    sku       = var.image_sku
    version   = var.image_version
  }
  
  tags = var.tags
}
