#!/bin/bash
# Script para conectarse a la VM
ssh -o StrictHostKeyChecking=no azureuser@20.57.43.71 << 'EOF'
echo "=== Información del sistema ==="
uname -a
echo ""
echo "=== Memoria disponible ==="
free -h
echo ""
echo "=== Espacio en disco ==="
df -h
echo ""
echo "=== Verificar si Docker está instalado ==="
which docker || echo "Docker no está instalado"
echo ""
echo "=== Verificar si Git está instalado ==="
which git || echo "Git no está instalado"
EOF
