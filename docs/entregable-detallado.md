# Entregable detallado - Actividad Trabajo K8S

## 1. Resumen ejecutivo

El entregable implementa un microservicio llamado **Catalog Service** construido con NestJS y Node.js. El servicio está completamente dockerizado, cuenta con pruebas unitarias, chart Helm parametrizable, despliegue en Kubernetes, integración GitOps con ArgoCD y pipeline CI/CD en GitHub Actions.

La solución cumple el flujo solicitado para la actividad:

1. Construcción de un microservicio básico.
2. Diseño del contenedor Docker.
3. Despliegue en Kubernetes usando Helm.
4. Personalización mediante valores por defecto y overrides.
5. Integración con ArgoCD como fuente GitOps.
6. Automatización con pipeline ante commits en la rama `main`.
7. Documentación y guion para el video de evidencia.

## 2. Microservicio implementado

### 2.1 Nombre

`catalog-service-k8s`

### 2.2 Propósito funcional

Simular un catálogo de productos expuesto mediante una API REST. Se eligió un dominio simple para enfocar la actividad en arquitectura, contenedores, Kubernetes, Helm, ArgoCD y CI/CD.

### 2.3 Endpoints

| Método | Ruta | Descripción | Uso técnico |
|---|---|---|---|
| GET | `/api/health` | Verifica salud del servicio | Liveness y readiness probes |
| GET | `/api/catalog` | Lista productos | Validación funcional |
| GET | `/api/catalog/:id` | Consulta un producto | Validación funcional |
| POST | `/api/catalog` | Crea producto temporal | Validación funcional |

### 2.4 Características técnicas

- Servicio stateless: no depende de base de datos externa.
- Código separado por módulos: health y catalog.
- Pruebas unitarias sobre la lógica principal.
- Variables de entorno para `NODE_ENV`, `PORT`, `API_PREFIX` y `APP_VERSION`.
- Endpoint de salud compatible con Kubernetes probes.

## 3. Dockerización

El archivo `Dockerfile` utiliza un enfoque multi-stage:

### 3.1 Etapa builder

- Usa `node:20-alpine`.
- Instala dependencias.
- Ejecuta pruebas unitarias.
- Compila TypeScript.

### 3.2 Etapa runtime

- Usa `node:20-alpine`.
- Instala solo dependencias productivas.
- Copia el resultado compilado desde la etapa builder.
- Expone el puerto `3000`.
- Define `HEALTHCHECK` contra `/api/health`.

Este diseño reduce el tamaño de la imagen final y evita llevar dependencias de desarrollo al runtime.

## 4. Kubernetes y Helm

### 4.1 Chart Helm

El chart está ubicado en:

```text
helm/catalog-service
```

Incluye:

- `Chart.yaml`
- `values.yaml`
- `values-dev.yaml`
- `values-prod.yaml`
- `templates/deployment.yaml`
- `templates/service.yaml`
- `templates/configmap.yaml`
- `templates/ingress.yaml`
- `templates/hpa.yaml`
- `templates/serviceaccount.yaml`
- `templates/_helpers.tpl`

### 4.2 Recursos Kubernetes generados

| Recurso | Propósito |
|---|---|
| Deployment | Ejecuta los pods del microservicio |
| Service | Expone internamente el microservicio |
| ConfigMap | Inyecta configuración no sensible |
| Ingress | Permite exposición HTTP mediante host |
| HPA | Escalamiento horizontal por CPU |
| ServiceAccount | Identidad de ejecución del pod |

### 4.3 Valores por entorno

| Archivo | Uso |
|---|---|
| `values.yaml` | Configuración base por defecto |
| `values-dev.yaml` | Configuración local/dev con imagen local y 1 réplica |
| `values-prod.yaml` | Configuración productiva con imagen GHCR, 2 réplicas, ingress y HPA |

## 5. ArgoCD

La integración GitOps se define en:

```text
argocd/application.yaml
```

ArgoCD toma como fuente el repositorio Git, lee el chart Helm y aplica `values-prod.yaml` en el namespace `catalog-service`.

La sincronización está configurada en modo automático:

```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

Esto permite que:

- ArgoCD corrija desviaciones manuales en el clúster.
- Se eliminen recursos obsoletos cuando desaparezcan del chart.
- Cada actualización del tag en Git termine desplegada en Kubernetes.

## 6. Pipeline CI/CD

El pipeline está en:

```text
.github/workflows/ci-cd.yml
```

### 6.1 Disparadores

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
```

### 6.2 Flujo automático

1. Checkout del repositorio.
2. Instalación de Node.js 20.
3. Instalación de dependencias.
4. Ejecución de pruebas unitarias.
5. Validación TypeScript.
6. Compilación del microservicio.
7. Construcción de imagen Docker.
8. Publicación de imagen en GHCR cuando el commit llega a `main`.
9. Actualización de `values-prod.yaml` con el SHA del commit.
10. Commit automático `[skip ci]` para evitar ciclos infinitos.
11. Validación del chart Helm.
12. ArgoCD detecta el cambio y despliega.

## 7. Comandos de validación

### 7.1 Pruebas locales

```bash
npm install
npm run test
npm run build
npm run start:dev
curl http://localhost:3000/api/health
```

### 7.2 Docker

```bash
docker build -t catalog-service-k8s:local .
docker run --rm -p 3000:3000 catalog-service-k8s:local
curl http://localhost:3000/api/health
```

### 7.3 Helm

```bash
helm lint helm/catalog-service
helm template catalog-service helm/catalog-service -f helm/catalog-service/values-dev.yaml
```

### 7.4 Kubernetes

```bash
kubectl create namespace catalog-service --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install catalog-service helm/catalog-service \
  -n catalog-service \
  -f helm/catalog-service/values-dev.yaml \
  --set image.repository=catalog-service-k8s \
  --set image.tag=local \
  --set image.pullPolicy=Never
kubectl get pods -n catalog-service
kubectl port-forward svc/catalog-service 3000:3000 -n catalog-service
curl http://localhost:3000/api/health
```

### 7.5 ArgoCD

```bash
bash argocd/install-argocd.sh
kubectl apply -f argocd/application.yaml
kubectl get applications -n argocd
```

## 8. Evidencia esperada

Para demostrar cumplimiento, el video debe mostrar:

1. Estructura del repositorio.
2. Código del microservicio.
3. Prueba local del endpoint `/api/health`.
4. Docker build exitoso.
5. Contenedor ejecutándose.
6. Helm lint y template.
7. Despliegue en Kubernetes.
8. Pods y services funcionando.
9. Aplicación registrada en ArgoCD.
10. Pipeline ejecutado ante un commit.
11. `values-prod.yaml` actualizado con tag de imagen.
12. Sincronización o estado saludable en ArgoCD.

## 9. Conclusión

El entregable implementa una ruta completa de construcción y despliegue moderno para microservicios: código, pruebas, contenedor, chart Helm, Kubernetes, GitOps con ArgoCD y pipeline CI/CD. La solución es mantenible porque separa configuración por entorno, usa plantillas Helm reutilizables y mantiene a Git como fuente de verdad para el despliegue.
