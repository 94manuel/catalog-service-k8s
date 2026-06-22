# Trabajo K8S - Microservicio Catalog Service

Este repositorio contiene el entregable completo para la actividad **Trabajo K8S**: microservicio funcional, Dockerfile, chart de Helm, despliegue en Kubernetes, definición de aplicación en ArgoCD, pipeline CI/CD y documentación para grabar el video de evidencia.

## 1. Objetivo del entregable

Implementar un microservicio básico, individualmente desplegable, que pueda ejecutarse localmente con Docker, desplegarse en Kubernetes mediante Helm, sincronizarse con ArgoCD y actualizarse automáticamente desde un pipeline cuando se detecta un commit sobre la rama `main`.

## 2. Arquitectura propuesta

```text
Desarrollador
   │
   ├── Commit / Pull Request en GitHub
   │
   ▼
GitHub Actions CI/CD
   ├── Instala dependencias
   ├── Ejecuta pruebas unitarias
   ├── Valida compilación TypeScript
   ├── Construye imagen Docker
   ├── Publica imagen en GHCR
   └── Actualiza tag en Helm values-prod.yaml
   │
   ▼
Repositorio Git
   │
   ▼
ArgoCD
   ├── Observa el repositorio Git
   ├── Detecta cambios en el chart Helm
   ├── Sincroniza la aplicación
   └── Despliega en Kubernetes
   │
   ▼
Kubernetes
   ├── Deployment
   ├── Service
   ├── ConfigMap
   ├── Ingress opcional
   ├── Probes de salud
   └── HPA opcional
```

## 3. Tecnologías usadas

| Tecnología | Uso en el entregable |
|---|---|
| Node.js 20 | Runtime del microservicio |
| NestJS | Framework del microservicio |
| Docker | Empaquetado del microservicio en contenedor |
| Kubernetes | Orquestación del contenedor |
| Helm | Plantillas parametrizables para desplegar el microservicio |
| ArgoCD | Despliegue GitOps desde el repositorio |
| GitHub Actions | Pipeline CI/CD ante commits en `main` |
| GHCR | Registro de imágenes Docker |

## 4. Endpoints del microservicio

El servicio expone los siguientes endpoints con prefijo `/api`:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de salud para Kubernetes y pruebas |
| GET | `/api/catalog` | Lista productos de ejemplo |
| GET | `/api/catalog/:id` | Consulta un producto por identificador |
| POST | `/api/catalog` | Crea un producto en memoria |

Ejemplo:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/catalog
```

## 5. Estructura del repositorio

```text
.
├── .github/workflows/ci-cd.yml       # Pipeline CI/CD
├── argocd/                           # Definición GitOps de ArgoCD
│   ├── application.yaml
│   ├── install-argocd.sh
│   └── namespace.yaml
├── docs/                             # Documentación académica y evidencia
│   ├── entregable-detallado.md
│   ├── evidencias-comandos.md
│   ├── guion-video.md
│   └── matriz-cumplimiento-rubrica.md
├── helm/catalog-service/             # Chart Helm del microservicio
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-prod.yaml
│   └── templates/
├── src/                              # Código fuente NestJS
├── test/                             # Pruebas unitarias
├── Dockerfile
├── Makefile
├── package.json
└── tsconfig.json
```

## 6. Ejecución local sin Docker

```bash
npm install
npm run test
npm run build
npm run start:dev
```

Prueba:

```bash
curl http://localhost:3000/api/health
```

## 7. Ejecución con Docker

```bash
docker build -t catalog-service-k8s:local .
docker run --rm -p 3000:3000 \
  -e NODE_ENV=local \
  -e API_PREFIX=api \
  catalog-service-k8s:local
```

Prueba:

```bash
curl http://localhost:3000/api/health
```

## 8. Despliegue local en Kubernetes con Helm

Requisito: tener un clúster local activo, por ejemplo Minikube o Kind.

```bash
kubectl create namespace catalog-service --dry-run=client -o yaml | kubectl apply -f -
helm lint helm/catalog-service
helm template catalog-service helm/catalog-service -n catalog-service -f helm/catalog-service/values-dev.yaml
helm upgrade --install catalog-service helm/catalog-service \
  -n catalog-service \
  -f helm/catalog-service/values-dev.yaml \
  --set image.repository=catalog-service-k8s \
  --set image.tag=local \
  --set image.pullPolicy=Never
```

Para probar en Minikube:

```bash
kubectl get pods -n catalog-service
kubectl port-forward svc/catalog-service 3000:3000 -n catalog-service
curl http://localhost:3000/api/health
```

## 9. Instalación de ArgoCD

```bash
bash argocd/install-argocd.sh
```

El archivo `argocd/application.yaml` ya quedó configurado con la ruta real del repositorio:

```yaml
repoURL: https://github.com/94manuel/catalog-service-k8s.git
```

Aplicar la aplicación:

```bash
kubectl apply -f argocd/application.yaml
kubectl get applications -n argocd
```

## 10. Pipeline CI/CD

El archivo `.github/workflows/ci-cd.yml` ejecuta el flujo completo:

1. Se activa con `push` a `main` y con `pull_request`.
2. Instala dependencias.
3. Ejecuta pruebas unitarias.
4. Valida TypeScript con `npm run lint`.
5. Construye la imagen Docker.
6. En `main`, publica la imagen en GHCR.
7. En `main`, actualiza `helm/catalog-service/values-prod.yaml` con el tag del commit.
8. ArgoCD detecta el cambio y sincroniza Kubernetes automáticamente.

## 11. Evidencia recomendada para el video

Grabe las siguientes pruebas:

```bash
npm run test
npm run build
docker build -t catalog-service-k8s:local .
docker run --rm -p 3000:3000 catalog-service-k8s:local
curl http://localhost:3000/api/health
helm lint helm/catalog-service
helm template catalog-service helm/catalog-service -f helm/catalog-service/values-dev.yaml
kubectl get pods -n catalog-service
kubectl get svc -n catalog-service
kubectl get applications -n argocd
```
