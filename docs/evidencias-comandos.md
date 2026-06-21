# Evidencias y comandos para grabar el video

Use este archivo como lista de chequeo durante la grabación del video.

## 1. Mostrar estructura del proyecto

```bash
tree -L 4
```

Alternativa en Windows PowerShell:

```powershell
Get-ChildItem -Recurse -Depth 3
```

## 2. Validar pruebas y compilación

```bash
npm install
npm run test
npm run build
```

Evidencia esperada:

- Tests pasan correctamente.
- TypeScript compila sin errores.
- Se genera carpeta `dist`.

## 3. Ejecutar localmente

```bash
npm run start:dev
```

En otra terminal:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/catalog
```

Evidencia esperada:

- `/api/health` responde `status: ok`.
- `/api/catalog` responde la lista de productos.

## 4. Construir y ejecutar Docker

```bash
docker build -t catalog-service-k8s:local .
docker run --rm -p 3000:3000 catalog-service-k8s:local
```

En otra terminal:

```bash
curl http://localhost:3000/api/health
```

Evidencia esperada:

- Build de Docker exitoso.
- Contenedor arriba.
- Healthcheck funcionando.

## 5. Validar Helm

```bash
helm lint helm/catalog-service
helm template catalog-service helm/catalog-service -f helm/catalog-service/values-dev.yaml
```

Evidencia esperada:

- `helm lint` sin errores.
- `helm template` genera manifiestos Kubernetes.

## 6. Desplegar en Kubernetes local

Si usa Minikube:

```bash
minikube start
minikube image load catalog-service-k8s:local
```

Desplegar:

```bash
kubectl create namespace catalog-service --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install catalog-service helm/catalog-service \
  -n catalog-service \
  -f helm/catalog-service/values-dev.yaml
```

Consultar recursos:

```bash
kubectl get all -n catalog-service
kubectl describe deployment catalog-service -n catalog-service
kubectl logs -l app.kubernetes.io/name=catalog-service -n catalog-service --tail=50
```

Probar servicio:

```bash
kubectl port-forward svc/catalog-service 3000:3000 -n catalog-service
curl http://localhost:3000/api/health
```

## 7. Instalar y validar ArgoCD

```bash
bash argocd/install-argocd.sh
kubectl get pods -n argocd
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Consultar contraseña inicial:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo
```

Aplicar aplicación:

```bash
kubectl apply -f argocd/application.yaml
kubectl get applications -n argocd
```

## 8. Evidenciar pipeline

1. Subir el repositorio a GitHub: `https://github.com/94manuel/catalog-service-k8s`.
2. Confirmar que `argocd/application.yaml` apunta a `https://github.com/94manuel/catalog-service-k8s.git`.
3. Hacer commit en `main`.
4. Abrir GitHub Actions.
5. Mostrar ejecución del workflow.
6. Confirmar imagen publicada en GHCR: `ghcr.io/94manuel/catalog-service-k8s`.
7. Confirmar cambio de tag en `helm/catalog-service/values-prod.yaml`.
8. Confirmar sincronización en ArgoCD.

Comando de commit de prueba:

```bash
git checkout -b feature/evidencia-k8s
echo "# evidencia" >> docs/evidencias-comandos.md
git add .
git commit -m "docs: add deployment evidence"
git push origin feature/evidencia-k8s
```

Luego abrir Pull Request hacia `main`. Al hacer merge, se activa el despliegue productivo.
