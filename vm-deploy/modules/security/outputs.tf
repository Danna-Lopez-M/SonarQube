output "nsg_id" {
  description = "ID of the network security group"
  value       = azurerm_network_security_group.nsg.id
}

output "nsg_name" {
  description = "Name of the network security group"
  value       = azurerm_network_security_group.nsg.name
}
