# Development Environment

Este directorio contiene la configuración de Terraform para el ambiente de desarrollo.

## Estructura

- `main.tf` - Configuración principal que orquesta los módulos
- `variables.tf` - Variables de entrada para el ambiente
- `outputs.tf` - Valores de salida del ambiente
- `terraform.tfvars` - Valores específicos para desarrollo

## Uso

### 1. Configurar credenciales de Azure

```bash
# Opción 1: Azure CLI (recomendado)
az login

# Opción 2: Variables de entorno
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret"
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"
```

### 2. Configurar la contraseña de administrador

```bash
# Crear archivo terraform.tfvars.local (no versionar)
echo 'admin_password = "TuContraseñaSegura123!"' > terraform.tfvars.local
```

### 3. Inicializar y desplegar

```bash
# Inicializar Terraform
terraform init

# Ver el plan de despliegue
terraform plan

# Aplicar los cambios
terraform apply
```

### 4. Conectarse a la VM

```bash
# Obtener la IP pública
terraform output vm_public_ip

# Conectarse por SSH
ssh azureuser@<IP_PUBLICA>
```

## Limpieza

```bash
# Destruir todos los recursos
terraform destroy
```

## Notas de Seguridad

- La contraseña de administrador se debe configurar en `terraform.tfvars.local`
- Este archivo NO debe ser versionado (está en .gitignore)
- Para producción, usar reglas de NSG más restrictivas
