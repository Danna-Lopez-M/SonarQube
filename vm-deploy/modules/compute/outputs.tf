output "vm_id" {
  description = "ID of the virtual machine"
  value       = azurerm_linux_virtual_machine.vm.id
}

output "vm_name" {
  description = "Name of the virtual machine"
  value       = azurerm_linux_virtual_machine.vm.name
}

output "vm_public_ip" {
  description = "Public IP address of the virtual machine"
  value       = var.public_ip_id
}

output "nic_id" {
  description = "ID of the network interface"
  value       = azurerm_network_interface.nic.id
}
