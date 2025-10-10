output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "vm_public_ip" {
  description = "Public IP address of the virtual machine"
  value       = module.networking.public_ip_address
}

output "vm_id" {
  description = "ID of the virtual machine"
  value       = module.compute.vm_id
}

output "vm_name" {
  description = "Name of the virtual machine"
  value       = module.compute.vm_name
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = module.networking.vnet_name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = module.networking.subnet_name
}

output "nsg_name" {
  description = "Name of the network security group"
  value       = module.security.nsg_name
}
