# Script de PowerShell para destruir el ambiente de desarrollo
# Uso: .\scripts\destroy-dev.ps1

# Obtener la ruta del directorio raiz del proyecto
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "Destruyendo ambiente de desarrollo..." -ForegroundColor Red

# Cambiar al directorio de desarrollo
Set-Location (Join-Path $RepoRoot "environments\dev")

# Confirmar antes de destruir
$confirmation = Read-Host "Estas seguro de que quieres destruir todos los recursos? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    Set-Location $RepoRoot
    exit 0
}

# Destruir recursos
Write-Host "Destruyendo recursos..." -ForegroundColor Blue
terraform destroy -auto-approve

if ($LASTEXITCODE -eq 0) {
    Write-Host "Recursos destruidos exitosamente!" -ForegroundColor Green
} else {
    Write-Host "Error al destruir recursos" -ForegroundColor Red
}

# Volver al directorio raiz del proyecto
Set-Location $RepoRoot
