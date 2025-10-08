#!/bin/bash

# Script para ejecutar análisis de seguridad con Trivy localmente
# Ejecutar con: bash trivy-scan.sh

set -e

echo "🔒 Análisis de Seguridad con Trivy"
echo "=================================="

# Verificar si Trivy está instalado
if ! command -v trivy &> /dev/null; then
    echo "❌ Trivy no está instalado. Instalando..."
    
    # Detectar el sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install wget apt-transport-https gnupg lsb-release
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install trivy
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install trivy
        else
            echo "❌ Homebrew no está instalado. Instala Trivy manualmente desde: https://github.com/aquasecurity/trivy"
            exit 1
        fi
    else
        echo "❌ Sistema operativo no soportado. Instala Trivy manualmente desde: https://github.com/aquasecurity/trivy"
        exit 1
    fi
fi

echo "✅ Trivy instalado correctamente"
echo ""

# Función para escanear una imagen
scan_image() {
    local image_name=$1
    local image_tag=$2
    local full_image="$image_name:$image_tag"
    
    echo "🔍 Escaneando imagen: $full_image"
    echo "----------------------------------------"
    
    # Escanear vulnerabilidades críticas y altas
    echo "📊 Vulnerabilidades críticas y altas:"
    trivy image "$full_image" --severity HIGH,CRITICAL --format table --exit-code 0
    
    echo ""
    echo "📋 Reporte detallado:"
    trivy image "$full_image" --format json --output "${image_name//\//-}-vulnerabilities.json"
    
    echo ""
    echo "📈 Estadísticas:"
    trivy image "$full_image" --severity CRITICAL,HIGH,MEDIUM,LOW --format table --exit-code 0 | tail -5
    
    echo ""
    echo "✅ Escaneo de $full_image completado"
    echo "========================================="
    echo ""
}

# Función para escanear el sistema de archivos
scan_filesystem() {
    echo "🔍 Escaneando sistema de archivos"
    echo "----------------------------------------"
    
    if [ -f "Dockerfile" ]; then
        echo "📊 Vulnerabilidades en el sistema de archivos:"
        trivy fs . --severity HIGH,CRITICAL --format table --exit-code 0
        
        echo ""
        echo "📋 Reporte detallado del sistema de archivos:"
        trivy fs . --format json --output filesystem-vulnerabilities.json
        
        echo ""
        echo "✅ Escaneo del sistema de archivos completado"
    else
        echo "ℹ️ No se encontró Dockerfile, omitiendo escaneo del sistema de archivos"
    fi
    
    echo "========================================="
    echo ""
}

# Función para generar resumen
generate_summary() {
    echo "📊 Resumen de Vulnerabilidades"
    echo "=============================="
    
    # Contar vulnerabilidades críticas
    SONARQUBE_CRITICAL=$(trivy image sonarqube:latest --severity CRITICAL --format json | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | .VulnerabilityID' | wc -l)
    SONARQUBE_HIGH=$(trivy image sonarqube:latest --severity HIGH --format json | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH") | .VulnerabilityID' | wc -l)
    
    POSTGRES_CRITICAL=$(trivy image postgres:13 --severity CRITICAL --format json | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | .VulnerabilityID' | wc -l)
    POSTGRES_HIGH=$(trivy image postgres:13 --severity HIGH --format json | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH") | .VulnerabilityID' | wc -l)
    
    echo "| Imagen | Críticas | Altas |"
    echo "|--------|----------|-------|"
    echo "| SonarQube | $SONARQUBE_CRITICAL | $SONARQUBE_HIGH |"
    echo "| PostgreSQL | $POSTGRES_CRITICAL | $POSTGRES_HIGH |"
    
    TOTAL_CRITICAL=$((SONARQUBE_CRITICAL + POSTGRES_CRITICAL))
    TOTAL_HIGH=$((SONARQUBE_HIGH + POSTGRES_HIGH))
    
    echo ""
    echo "**Total:** $TOTAL_CRITICAL críticas, $TOTAL_HIGH altas"
    echo ""
    
    if [ $TOTAL_CRITICAL -gt 0 ]; then
        echo "🚨 **ATENCIÓN:** Se encontraron $TOTAL_CRITICAL vulnerabilidades críticas!"
        echo "   Se recomienda revisar y corregir antes de desplegar en producción."
    elif [ $TOTAL_HIGH -gt 0 ]; then
        echo "⚠️ **ADVERTENCIA:** Se encontraron $TOTAL_HIGH vulnerabilidades de alta severidad."
        echo "   Se recomienda revisar y considerar actualizaciones."
    else
        echo "✅ **EXCELENTE:** No se encontraron vulnerabilidades críticas o altas."
    fi
    
    echo ""
    echo "📋 **Recomendaciones:**"
    echo "1. Revisar vulnerabilidades críticas inmediatamente"
    echo "2. Actualizar imágenes base a las últimas versiones"
    echo "3. Aplicar parches de seguridad regularmente"
    echo "4. Considerar usar imágenes distroless para producción"
    echo "5. Implementar escaneo automático en CI/CD"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -i, --images   Escanear solo las imágenes Docker"
    echo "  -f, --fs       Escanear solo el sistema de archivos"
    echo "  -a, --all      Escanear todo (imágenes + sistema de archivos) [por defecto]"
    echo "  -s, --summary  Mostrar solo el resumen"
    echo ""
    echo "Ejemplos:"
    echo "  $0              # Escanear todo"
    echo "  $0 --images     # Escanear solo imágenes"
    echo "  $0 --summary    # Mostrar solo resumen"
}

# Procesar argumentos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -i|--images)
        echo "🔒 Escaneando solo imágenes Docker"
        echo "=================================="
        scan_image "sonarqube" "latest"
        scan_image "postgres" "13"
        generate_summary
        ;;
    -f|--fs)
        echo "🔒 Escaneando solo sistema de archivos"
        echo "====================================="
        scan_filesystem
        ;;
    -s|--summary)
        echo "🔒 Generando resumen de vulnerabilidades"
        echo "======================================="
        generate_summary
        ;;
    -a|--all|"")
        echo "🔒 Escaneo completo de seguridad"
        echo "==============================="
        scan_image "sonarqube" "latest"
        scan_image "postgres" "13"
        scan_filesystem
        generate_summary
        ;;
    *)
        echo "❌ Opción no válida: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🎉 Análisis de seguridad completado!"
echo "📁 Los reportes detallados se guardaron en archivos JSON"
echo "🔍 Revisa los archivos *-vulnerabilities.json para más detalles"
