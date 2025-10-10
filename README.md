# Despliegue de SonarQube y Trivy en VM Azure

**Danna Valentina López Muñoz - A00395625**

Este documento describe el proceso de despliegue de SonarQube y Trivy en una máquina virtual de Azure usando Docker.

##  Resumen del Proceso

### 1. Ejecución de Sonar y Trivy en local

Lo primero que se hizo fue probar que Sonar y Trivy funcionaran de manera local para el proyecto, primero se configuro SonarQube, agregando los archivos ´docker-compose.yml´ y ´sonar-project.properties´

![Ejecucción de SonarQube](imagenes/dockerfile.png)

![Ejecucción de SonarQube](imagenes/sonar.png)

 y se ejecuto el contenedor

![Ejecucción del Contenedor](imagenes/ejecucion-contenedor.png)

Posteriormente ejecutamos los siguientes comandos para analizar el proyecto con SonarQube y detectar que vulnerabilidades pueden haber en el proyecto

```bash
npm test -- --coverage
```

Este comando generará el archivo coverage/lcov.info que SonarQube usará. Y por siguiente ejecutaremos:
```bash
docker run --rm \
  --network sonarqube_sonarnet \
  -e SONAR_HOST_URL="http://sonarqube:9000" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
```

Por lo que cuando accedemos a la URL ´http://sonarqube:9000´ podemos ver que ya se carga el proyecto y podemos analizar la calidad del código y qué correciones se deben de realizar. Por ejemplo, en este caso se tiene un coverage del 82% y la condición para aprobar código es que fuera al menos del 80%. 
![Análisis del proyecto en SonarQube](imagenes/proyecto-sonar.png)

Ahora, para configurar Trivy lo que se hizo fue agregar el servicio al ´docker-compose.yml´ y ejecutar el siguiente comando

```bash
docker compose run --rm trivy fs --severity HIGH,CRITICAL /project
```
 
 Que genera el siguiente reporte

 [Reporte Trivy 1](imagenes/reporte-trivy1.png)
 [Reporte Trivy 2](imagenes/reporte-trivy2.png)


### 2. Despliegue de la Máquina Virtual

Se utilizó el proyecto Terraform existente en `terraform` para desplegar la infraestructura:

```bash
cd terraform/environments/dev
terraform init
terraform plan -var="admin_password=AzureVM123!"
terraform apply -var="admin_password=AzureVM123!" -auto-approve
```

**Recursos desplegados:**
- Resource Group: `rg-ingesoft-dev`
- Virtual Network: `vnet-ingesoft-dev`
- Subnet: `snet-ingesoft-dev`
- Network Security Group: `nsg-ingesoft-dev`
- Public IP: `pip-ingesoft-dev`
- Virtual Machine: `vm-ingesoft-dev`

### 2. Configuración de la VM

La VM se desplegó con las siguientes características:
- **OS:** Ubuntu 22.04 LTS
- **Tamaño:** Standard_B1s (1 vCPU, 1GB RAM)
- **IP Pública:** 20.57.43.71
- **Usuario:** azureuser
- **Contraseña:** AzureVM123!


### 3. Instalación de Docker

Se instaló Docker y Docker Compose en la VM usando el repositorio oficial de Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker azureuser
```

![Instalación de Docker](imagenes/instalar-dockerVM.png)

### 4. Configuración del Proyecto

Se creó el directorio del proyecto y se configuraron los archivos necesarios:

```bash
mkdir -p /home/azureuser/project-backend-rentastech
cd /home/azureuser/project-backend-rentastech
```

#### docker-compose.yml
```yaml
version: '2'

services:
  sonarqube:
    image: sonarqube:latest
    ports:
      - "9000:9000"
    networks:
      - sonarnet
    environment:
      - SONARQUBE_JDBC_URL=jdbc:postgresql://db:5432/sonar
      - SONARQUBE_JDBC_USERNAME=sonar
      - SONARQUBE_JDBC_PASSWORD=sonar
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
      - SONAR_WEB_JAVAADDITIONALOPTS=-Xmx512m -Xms256m
      - SONAR_SEARCH_JAVAADDITIONALOPTS=-Xmx256m -Xms128m
    volumes:
      - sonarqube_conf:/opt/sonarqube/conf
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_bundled-plugins:/opt/sonarqube/lib/bundled-plugins

  db:
    image: postgres:13
    networks:
      - sonarnet
    environment:
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

networks:
  sonarnet:
    driver: bridge

volumes:
  sonarqube_conf:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_bundled-plugins:
  postgresql:
  postgresql_data:
```

#### sonar-project.properties
```properties
# SonarQube project configuration
sonar.projectKey=project-backend-rentastech
sonar.projectName=project-backend-rentastech
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8

# Sources and tests
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts,**/*.integration.spec.ts,**/*e2e-spec.ts

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.d.ts,**/*.spec.ts,**/*.integration.spec.ts,**/*e2e-spec.ts

# Coverage (Jest -> LCOV)
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.tsconfigPath=tsconfig.json
```

![Clonación del proyecto](imagenes/clonar-proyecto-en-VM.png)

### 5. Despliegue de SonarQube

Se inició SonarQube usando Docker Compose:

```bash
sudo docker-compose up -d
```

![Instalación en la VM](imagenes/instalacion-en-VM.png)

### 6. Configuración de Seguridad de Red

Se agregó una regla al Network Security Group para permitir el tráfico en el puerto 9000:

```bash
az network nsg rule create \
  --resource-group rg-ingesoft-dev \
  --nsg-name nsg-ingesoft-dev \
  --name allow-sonarqube \
  --priority 1002 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes '*' \
  --destination-address-prefix '*' \
  --destination-port-ranges 9000 \
  --description "Allow SonarQube access"
```

### 7. Pipeline Automatizado de Despliegue

Se implementó un pipeline de GitHub Actions para automatizar el despliegue de SonarQube:

#### Configuración de Secrets

Primero, configura los secrets necesarios en GitHub:

```bash
# Ejecutar el script de configuración
bash setup-github-secrets.sh
```

O configurar manualmente en GitHub:
- `VM_PUBLIC_IP`: IP pública de la VM (ej: 20.57.43.71)
- `VM_USERNAME`: Usuario de la VM (ej: azureuser)
- `VM_PASSWORD`: Contraseña de la VM

#### Pipeline Automatizado

El pipeline `.github/workflows/deploy-sonarqube-vm.yml` realiza automáticamente:

1. **Verificación de conectividad** con la VM
2. **Copia de archivos** (docker-compose.yml, sonar-project.properties)
3. **Instalación de Docker** (si no está instalado)
4. **Despliegue de SonarQube** con Docker Compose
5. **Configuración del NSG** para el puerto 9000
6. **Verificación de salud** del servicio
7. **Notificaciones** en PRs y resumen de despliegue

#### Triggers del Pipeline

El pipeline se ejecuta automáticamente en:
- Push a ramas `main` o `develop`
- Pull Requests a `main`
- Ejecución manual con selección de environment

#### Ventajas del Pipeline Automatizado

- **Despliegue automático** sin intervención manual
- **Verificación de salud** del servicio
- **Configuración automática** del NSG
- **Notificaciones** en PRs
- **Rollback automático** en caso de fallos
- **Logs detallados** del proceso

### 8. Análisis de Seguridad con Trivy

Se implementó análisis automático de vulnerabilidades usando Trivy para escanear las imágenes Docker:

#### Pipeline de Seguridad

El pipeline `.github/workflows/security-scan.yml` realiza automáticamente:

1. **Escaneo de imágenes Docker** (SonarQube y PostgreSQL)
2. **Análisis del sistema de archivos** (si existe Dockerfile)
3. **Detección de secretos** en el código
4. **Verificación de configuración** de seguridad
5. **Reportes detallados** en múltiples formatos
6. **Integración con GitHub Security** tab
7. **Comentarios automáticos** en PRs con resultados

#### Configuración de Trivy

- **Archivo de configuración:** `trivy.yaml`
- **Archivo de ignorar:** `.trivyignore`
- **Script local:** `trivy-scan.sh`

#### Triggers del Pipeline de Seguridad

El pipeline se ejecuta automáticamente en:
- Push a ramas `main` o `develop`
- Pull Requests a `main`
- **Ejecución programada** diaria a las 2 AM UTC
- Ejecución manual

#### Características del Análisis

- ✅ **Escaneo de vulnerabilidades** en imágenes Docker
- ✅ **Detección de secretos** en el código
- ✅ **Análisis de configuración** de seguridad
- ✅ **Reportes en múltiples formatos** (JSON, SARIF, tabla)
- ✅ **Integración con GitHub Security** tab
- ✅ **Fallar build** si hay vulnerabilidades críticas
- ✅ **Notificaciones automáticas** en PRs

#### Uso Local de Trivy

```bash
# Instalar y ejecutar análisis completo
bash trivy-scan.sh

# Solo escanear imágenes Docker
bash trivy-scan.sh --images

# Solo escanear sistema de archivos
bash trivy-scan.sh --fs

# Mostrar solo resumen
bash trivy-scan.sh --summary
```

### Gestión de Seguridad con Trivy

```bash
# Análisis completo de seguridad
bash trivy-scan.sh

# Escanear solo imágenes específicas
trivy image sonarqube:latest
trivy image postgres:13

# Escanear con configuración personalizada
trivy image sonarqube:latest --config trivy.yaml

# Generar reporte en formato SARIF
trivy image sonarqube:latest --format sarif --output sonarqube.sarif

# Escanear sistema de archivos
trivy fs . --severity HIGH,CRITICAL

# Ver vulnerabilidades ignoradas
cat .trivyignore
```

## Imágenes del Proceso

### Estructura del Proyecto
![Estructura del proyecto](imagenes/proyecto.PNG)

### Ejecución de la Imagen
![Ejecución de la imagen](imagenes/ejecucion-imagen.png)

### Configuración de SonarQube
![Configuración de SonarQube](imagenes/sonar.PNG)

### Dockerfile
![Dockerfile](imagenes/dockerfile.PNG)

### Coverage
![Coverage](imagenes/coverage.PNG)


