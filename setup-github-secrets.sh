#!/bin/bash

# Script para configurar los secrets de GitHub Actions para el despliegue automático de SonarQube
# Ejecutar con: bash setup-github-secrets.sh

set -e

echo "🔧 Configurando Secrets de GitHub Actions para SonarQube"
echo "======================================================"

# Verificar si GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado. Instálalo desde: https://cli.github.com/"
    echo "   O ejecuta: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "   sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "   echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "   sudo apt update && sudo apt install gh"
    exit 1
fi

# Verificar si está logueado en GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Iniciando sesión en GitHub..."
    gh auth login
fi

# Obtener información del repositorio
REPO_INFO=$(gh repo view --json name,owner)
REPO_NAME=$(echo $REPO_INFO | jq -r '.name')
REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')

echo "📋 Información del repositorio:"
echo "   Owner: $REPO_OWNER"
echo "   Repository: $REPO_NAME"
echo ""

# Solicitar información de la VM
echo "🔧 Configuración de la VM:"
read -p "Ingresa la IP pública de la VM (ej: 20.57.43.71): " VM_IP
read -p "Ingresa el nombre de usuario de la VM (ej: azureuser): " VM_USERNAME
read -p "Ingresa la contraseña de la VM: " VM_PASSWORD

if [ -z "$VM_IP" ] || [ -z "$VM_USERNAME" ] || [ -z "$VM_PASSWORD" ]; then
    echo "❌ Todos los campos son obligatorios"
    exit 1
fi

echo ""
echo "🚀 Configurando secrets en GitHub..."

# Configurar secrets
echo "Configurando VM_PUBLIC_IP..."
gh secret set VM_PUBLIC_IP --body "$VM_IP" --repo "$REPO_OWNER/$REPO_NAME"

echo "Configurando VM_USERNAME..."
gh secret set VM_USERNAME --body "$VM_USERNAME" --repo "$REPO_OWNER/$REPO_NAME"

echo "Configurando VM_PASSWORD..."
gh secret set VM_PASSWORD --body "$VM_PASSWORD" --repo "$REPO_OWNER/$REPO_NAME"

echo ""
echo "✅ Secrets configurados exitosamente!"
echo ""
echo "📋 Secrets configurados:"
echo "   VM_PUBLIC_IP: $VM_IP"
echo "   VM_USERNAME: $VM_USERNAME"
echo "   VM_PASSWORD: [oculto]"
echo ""
echo "📖 Próximos pasos:"
echo "1. Haz push de los cambios a la rama main"
echo "2. El pipeline se ejecutará automáticamente"
echo "3. SonarQube se desplegará automáticamente en la VM"
echo ""
echo "🔍 Para verificar el pipeline:"
echo "   gh run list --repo $REPO_OWNER/$REPO_NAME"
echo ""
echo "🎉 ¡Configuración completada!"
echo "Ahora puedes desplegar SonarQube automáticamente usando GitHub Actions."
