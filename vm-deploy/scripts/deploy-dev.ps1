# Script de PowerShell para desplegar el ambiente de desarrollo
# Uso: .\scripts\deploy-dev.ps1

Write-Host "Desplegando ambiente de desarrollo..." -ForegroundColor Green

# Cambiar al directorio de desarrollo
Set-Location "environments\dev"

# Verificar si existe terraform.tfvars.local
if (-not (Test-Path "terraform.tfvars.local")) {
    Write-Host "Error: No se encontró terraform.tfvars.local" -ForegroundColor Red
    Write-Host "Crea el archivo con: echo 'admin_password = \"TuContraseña123!\"' > terraform.tfvars.local" -ForegroundColor Yellow
    exit 1
}

# Inicializar Terraform
Write-Host "Inicializando Terraform..." -ForegroundColor Blue
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en terraform init" -ForegroundColor Red
    exit 1
}

# Planificar el despliegue
Write-Host "Planificando despliegue..." -ForegroundColor Blue
terraform plan -out=tfplan

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en terraform plan" -ForegroundColor Red
    exit 1
}

# Aplicar el plan
Write-Host "Aplicando cambios..." -ForegroundColor Blue
terraform apply tfplan

if ($LASTEXITCODE -eq 0) {
    Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "IP Pública de la VM:" -ForegroundColor Yellow
    terraform output vm_public_ip
    Write-Host "Para conectarte: ssh azureuser@<IP_PUBLICA>" -ForegroundColor Cyan
} else {
    Write-Host "Error en terraform apply" -ForegroundColor Red
}

# Limpiar archivo de plan
Remove-Item tfplan -ErrorAction SilentlyContinue

# Volver al directorio raíz
Set-Location "..\.."
