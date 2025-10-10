#!/bin/bash

# Script para destruir el ambiente de desarrollo en Linux
# Uso: ./scripts/destroy-dev.sh

# Obtener la ruta del directorio raíz del proyecto
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "\033[0;31mDestruyendo ambiente de desarrollo...\033[0m"

# Cambiar al directorio de desarrollo
cd "$REPO_ROOT/environments/dev" || {
  echo -e "\033[0;31mError: No se pudo acceder a environments/dev\033[0m"
  exit 1
}

# Confirmar antes de destruir
read -p "¿Estás seguro de que quieres destruir todos los recursos? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
  echo -e "\033[1;33mOperación cancelada.\033[0m"
  cd "$REPO_ROOT"
  exit 0
fi

# Destruir recursos
echo -e "\033[0;34mDestruyendo recursos...\033[0m"
terraform destroy -auto-approve

if [ $? -eq 0 ]; then
  echo -e "\033[0;32mRecursos destruidos exitosamente!\033[0m"
else
  echo -e "\033[0;31mError al destruir recursos.\033[0m"
fi

# Volver al directorio raíz del proyecto
cd "$REPO_ROOT"
