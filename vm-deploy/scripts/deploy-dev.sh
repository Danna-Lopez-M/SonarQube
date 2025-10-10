#!/bin/bash

echo -e "\033[0;32mDesplegando ambiente de desarrollo...\033[0m"

# Cambiar al directorio de desarrollo
cd environments/dev || {
  echo -e "\033[0;31mError: No se pudo acceder a environments/dev\033[0m"
  exit 1
}

# Verificar si existe terraform.tfvars.local
if [ ! -f "terraform.tfvars.local" ]; then
  echo -e "\033[0;31mError: No se encontró terraform.tfvars.local\033[0m"
  echo -e "\033[1;33mCrea el archivo con:\033[0m"
  echo "echo 'admin_password = \"TuContraseña123!\"' > terraform.tfvars.local"
  exit 1
fi

# Inicializar Terraform
echo -e "\033[0;34mInicializando Terraform...\033[0m"
terraform init
if [ $? -ne 0 ]; then
  echo -e "\033[0;31mError en terraform init\033[0m"
  exit 1
fi

# Planificar el despliegue
echo -e "\033[0;34mPlanificando despliegue...\033[0m"
terraform plan -out=tfplan
if [ $? -ne 0 ]; then
  echo -e "\033[0;31mError en terraform plan\033[0m"
  exit 1
fi

# Aplicar el plan
echo -e "\033[0;34mAplicando cambios...\033[0m"
terraform apply tfplan
if [ $? -eq 0 ]; then
  echo -e "\033[0;32mDespliegue completado exitosamente!\033[0m"
  echo -e "\033[1;33mIP Pública de la VM:\033[0m"
  terraform output vm_public_ip
  echo -e "\033[0;36mPara conectarte: ssh azureuser@<IP_PUBLICA>\033[0m"
else
  echo -e "\033[0;31mError en terraform apply\033[0m"
fi

# Limpiar archivo de plan
rm -f tfplan

# Volver al directorio raíz
cd ../..

