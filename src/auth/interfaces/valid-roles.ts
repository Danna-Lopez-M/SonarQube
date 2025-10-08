export enum ValidRoles {
  admin = 'admin',
  client = 'client',
  salesperson = 'salesperson',
  technician = 'technician',
  labTechnician = 'labTechnician',
}

export const RolePermissions = {
  [ValidRoles.client]: [
    'view-own-contracts',
    'view-own-equipment',
    'create-requests'
  ],
  [ValidRoles.salesperson]: [
    'manage-requests',
    'manage-contracts',
    'manage-delivery-notes'
  ],
  [ValidRoles.technician]: [
    'register-deliveries',
    'register-returns',
    'register-visual-observations'
  ],
  [ValidRoles.labTechnician]: [
    'register-technical-observations',
    'change-equipment-status'
  ],
  [ValidRoles.admin]: [
    'manage-users',
    'manage-products',
    'manage-reports',
    'manage-roles',
    'view-all-contracts',
    'view-all-equipment'
  ]
};