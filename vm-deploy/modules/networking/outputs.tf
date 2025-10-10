output "vnet_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.vnet.id
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.vnet.name
}

output "subnet_id" {
  description = "ID of the subnet"
  value       = azurerm_subnet.subnet.id
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = azurerm_subnet.subnet.name
}

output "public_ip_id" {
  description = "ID of the public IP"
  value       = azurerm_public_ip.public_ip.id
}

output "public_ip_address" {
  description = "Public IP address"
  value       = azurerm_public_ip.public_ip.ip_address
}
