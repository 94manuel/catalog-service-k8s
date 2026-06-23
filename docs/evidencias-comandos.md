# Evidencias y comandos

Use este archivo como lista de chequeo durante la grabación del video.

> Ambiente usado para la evidencia:
>
> * Windows 11
> * Docker Desktop
> * Minikube con driver Docker
> * Kubernetes local
> * Helm
> * ArgoCD
> * GitHub Actions
> * Repositorio: `https://github.com/94manuel/catalog-service-k8s`

---

## 0. Recomendaciones antes de grabar

Antes de iniciar la evidencia:

1. Abrir **Docker Desktop** y esperar a que esté corriendo.
2. Cerrar terminales que tengan `kubectl port-forward` activo.
3. Cerrar comandos en modo seguimiento como `kubectl get pods -w` usando `Ctrl + C`.
4. Ejecutar los comandos desde la raíz del proyecto:

```powershell
cd "D:\maestria\Arquitectura de software\actividad 3\k8s-activity-deliverable\k8s-activity-deliverable"
```

Validar herramientas:

```powershell
node -v
npm -v
docker --version
kubectl version --client
helm version
minikube version
git --version
```

Validar que Docker está funcionando:

```powershell
docker ps
```

---

## 1. Mostrar estructura del proyecto

En Windows PowerShell:

```powershell
Get-ChildItem -Recurse -Depth 3
```

Evidencia esperada:

```text
src/
test/
helm/catalog-service/
argocd/
.github/workflows/
docs/
Dockerfile
README.md
package.json
```

---

## 2. Validar pruebas y compilación

Instalar dependencias:

```powershell
npm install
```

Ejecutar pruebas:

```powershell
npm run test
```

Compilar:

```powershell
npm run build
```

Evidencia esperada:

* Las pruebas pasan correctamente.
* TypeScript compila sin errores.
* Se genera la carpeta `dist`.

---

## 3. Ejecutar el microservicio localmente

Terminal 1:

```powershell
npm run start:dev
```

Terminal 2:

```powershell
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3000/api/catalog
```

Evidencia esperada:

* `/api/health` responde `status: ok`.
* `/api/catalog` responde la lista de productos.

Cuando termine la prueba local, detener el servidor con:

```text
Ctrl + C
```

---

## 4. Construir y ejecutar Docker

Construir imagen:

```powershell
docker build -t catalog-service-k8s:local .
```

Ejecutar contenedor:

```powershell
docker run --rm -p 3000:3000 --name catalog-service catalog-service-k8s:local
```

En otra terminal:

```powershell
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3000/api/catalog
```

Evidencia esperada:

* La imagen Docker se construye correctamente.
* El contenedor inicia sin errores.
* El endpoint `/api/health` responde correctamente.

Detener el contenedor con:

```text
Ctrl + C
```

Si el contenedor queda activo, eliminarlo con:

```powershell
docker rm -f catalog-service
```

---

## 5. Configurar Kubernetes local desde cero con Minikube

> Use esta sección si el clúster anterior quedó dañado, apagado o con `kubeconfig` mal configurado.

Eliminar clúster anterior:

```powershell
minikube delete
```

Crear clúster nuevo con Docker:

```powershell
minikube start --driver=docker --cpus=4 --memory=6144
```

Actualizar contexto:

```powershell
minikube update-context
kubectl config use-context minikube
```

Validar estado:

```powershell
minikube status
kubectl get nodes
```

Evidencia esperada:

```text
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

Y:

```text
NAME       STATUS   ROLES           VERSION
minikube   Ready    control-plane    ...
```

---

## 6. Cargar la imagen local en Minikube

Como el despliegue local usa:

```text
image: catalog-service-k8s:local
imagePullPolicy: Never
```

la imagen debe cargarse dentro de Minikube.

Construir imagen:

```powershell
docker build -t catalog-service-k8s:local .
```

Cargar imagen:

```powershell
minikube image load catalog-service-k8s:local
```

Validar imagen:

```powershell
minikube image ls | Select-String catalog-service-k8s
```

Evidencia esperada:

```text
catalog-service-k8s:local
```

---

## 7. Validar Helm

Ejecutar validación del chart:

```powershell
helm lint helm/catalog-service
```

Renderizar manifiestos:

```powershell
helm template catalog-service helm/catalog-service -f helm/catalog-service/values-dev.yaml
```

Evidencia esperada:

* `helm lint` sin errores.
* `helm template` genera recursos Kubernetes como:

  * `ServiceAccount`
  * `ConfigMap`
  * `Service`
  * `Deployment`
  * `Ingress`

---

## 8. Desplegar en Kubernetes local con Helm

Crear namespace:

```powershell
kubectl create namespace catalog-service --dry-run=client -o yaml | kubectl apply -f -
```

Desplegar microservicio:

```powershell
helm upgrade --install catalog-service helm/catalog-service -n catalog-service -f helm/catalog-service/values-dev.yaml
```

Consultar recursos:

```powershell
kubectl get all -n catalog-service
```

Consultar detalle del deployment:

```powershell
kubectl describe deployment catalog-service -n catalog-service
```

Consultar logs:

```powershell
kubectl logs -l app.kubernetes.io/name=catalog-service -n catalog-service --tail=50
```

Evidencia esperada:

```text
pod/catalog-service-xxxxx        1/1   Running
service/catalog-service          ClusterIP   3000/TCP
deployment.apps/catalog-service  1/1
```

---

## 9. Probar el servicio desplegado en Kubernetes

Terminal 1:

```powershell
kubectl port-forward svc/catalog-service 3000:3000 -n catalog-service
```

Terminal 2:

```powershell
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3000/api/catalog
```

Evidencia esperada:

* `/api/health` responde correctamente.
* `/api/catalog` responde correctamente.
* El microservicio está funcionando dentro de Kubernetes.

Cuando termine la prueba, detener el `port-forward` con:

```text
Ctrl + C
```

---

## 10. Instalar ArgoCD

Crear namespace:

```powershell
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
```

Instalar ArgoCD:

```powershell
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

En este equipo puede aparecer `ErrImagePull` al descargar la imagen de ArgoCD desde `quay.io`. Para evitarlo, descargar y cargar manualmente la imagen:

```powershell
docker pull quay.io/argoproj/argocd:v3.4.4
minikube image load quay.io/argoproj/argocd:v3.4.4
```

Recrear pods de ArgoCD:

```powershell
kubectl delete pod -n argocd --all
```

Esperar a que todos queden en `Running`:

```powershell
kubectl get pods -n argocd -w
```

Cuando todos estén en `Running`, salir con:

```text
Ctrl + C
```

Validar:

```powershell
kubectl get pods -n argocd
```

Evidencia esperada:

```text
argocd-application-controller-0                     1/1   Running
argocd-applicationset-controller-xxxxx              1/1   Running
argocd-dex-server-xxxxx                             1/1   Running
argocd-notifications-controller-xxxxx               1/1   Running
argocd-redis-xxxxx                                  1/1   Running
argocd-repo-server-xxxxx                            1/1   Running
argocd-server-xxxxx                                 1/1   Running
```

---

## 11. Validar archivo de aplicación ArgoCD

Para despliegue local, el archivo `argocd/application.yaml` debe usar `values-dev.yaml`.

Validar contenido:

```powershell
Get-Content .\argocd\application.yaml
```

Debe tener:

```yaml
repoURL: https://github.com/94manuel/catalog-service-k8s.git
targetRevision: master
path: helm/catalog-service
helm:
  valueFiles:
    - values-dev.yaml
```

Si aparece `values-prod.yaml`, cambiarlo con:

```powershell
(Get-Content .\argocd\application.yaml) -replace 'values-prod.yaml','values-dev.yaml' | Set-Content .\argocd\application.yaml
```

Validar nuevamente:

```powershell
Get-Content .\argocd\application.yaml
```

---

## 12. Crear aplicación en ArgoCD

Aplicar la definición:

```powershell
kubectl apply -f .\argocd\application.yaml
```

Validar aplicación:

```powershell
kubectl get applications -n argocd
```

Esperar unos segundos y volver a consultar:

```powershell
kubectl get applications -n argocd
```

Evidencia esperada:

```text
NAME              SYNC STATUS   HEALTH STATUS
catalog-service   Synced        Healthy
```

Si no muestra estado, consultar detalle:

```powershell
kubectl describe application catalog-service -n argocd
```

---

## 13. Abrir consola web de ArgoCD

Terminal 1:

```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Abrir en navegador:

```text
https://localhost:8080
```

Usuario:

```text
admin
```

Obtener contraseña inicial:

```powershell
$ARGOCD_PASSWORD = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($ARGOCD_PASSWORD))
```

> No usar la variable `$pwd`, porque en PowerShell puede confundirse con la ruta actual.

Evidencia esperada en ArgoCD:

```text
Application: catalog-service
Sync Status: Synced
Health Status: Healthy
```

---

## 14. Evidenciar pipeline CI/CD en GitHub

Repositorio:

```text
https://github.com/94manuel/catalog-service-k8s
```

Validar que el remoto esté configurado:

```powershell
git remote -v
```

Debe apuntar a:

```text
https://github.com/94manuel/catalog-service-k8s.git
```

Validar rama principal:

```powershell
git branch
```

La rama principal debe ser:

```text
master
```

Si el proyecto está en otra rama, usar:

```powershell
git branch -M master
```

Subir cambios:

```powershell
git add .
git commit -m "chore: prepare k8s helm argocd evidence"
git push origin master
```

Abrir en GitHub:

```text
Repository → Actions
```

Mostrar ejecución del workflow.

Evidencia esperada:

* Workflow ejecutado por commit en `master`.
* Instalación de dependencias.
* Ejecución de pruebas.
* Compilación.
* Construcción de imagen Docker.
* Validación de Helm.
* Publicación de imagen en GHCR, si el workflow está configurado para ello.

Imagen esperada en GHCR:

```text
ghcr.io/94manuel/catalog-service-k8s
```

---

## 15. Commit de prueba para demostrar automatización

Crear cambio mínimo:

```powershell
Add-Content .\docs\evidencias-comandos.md "`nEvidencia de ejecución CI/CD."
```

Confirmar cambio:

```powershell
git status
```

Crear commit:

```powershell
git add .
git commit -m "docs: add deployment evidence"
git push origin master
```

Luego abrir:

```text
GitHub → Actions
```

Evidencia esperada:

* Se ejecuta automáticamente el workflow.
* El pipeline queda en verde.
* Se demuestra automatización CI/CD ante un commit.

---

## 16. Comandos finales para mostrar en el video

Mostrar estado general del clúster:

```powershell
kubectl get nodes
```

Mostrar microservicio:

```powershell
kubectl get all -n catalog-service
```

Mostrar ArgoCD:

```powershell
kubectl get pods -n argocd
kubectl get applications -n argocd
```

Probar endpoint:

Terminal 1:

```powershell
kubectl port-forward svc/catalog-service 3000:3000 -n catalog-service
```

Terminal 2:

```powershell
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3000/api/catalog
```

Mostrar en navegador:

```text
https://localhost:8080
```

Evidencia visual esperada:

* `catalog-service` en Kubernetes.
* `catalog-service` en ArgoCD.
* Estado `Synced`.
* Estado `Healthy`.
* Pipeline en GitHub Actions en verde.
* Endpoints respondiendo correctamente.

---

## 17. Checklist final de entrega

```text
[ ] Docker Desktop está corriendo.
[ ] Minikube está en Running.
[ ] kubectl get nodes muestra minikube Ready.
[ ] npm run test pasa correctamente.
[ ] npm run build pasa correctamente.
[ ] docker build genera la imagen catalog-service-k8s:local.
[ ] minikube image load carga la imagen local.
[ ] helm lint no muestra errores.
[ ] helm template genera manifiestos.
[ ] helm upgrade despliega el microservicio.
[ ] kubectl get all -n catalog-service muestra pod Running.
[ ] curl.exe /api/health responde correctamente.
[ ] ArgoCD tiene todos sus pods Running.
[ ] kubectl get applications -n argocd muestra catalog-service.
[ ] ArgoCD muestra Synced / Healthy.
[ ] GitHub Actions ejecuta el pipeline.
[ ] El video muestra todo el flujo.
```
