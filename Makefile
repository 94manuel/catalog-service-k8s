IMAGE_NAME ?= catalog-service-k8s
IMAGE_TAG ?= local
NAMESPACE ?= catalog-service

install:
	npm install

test:
	npm run test

build:
	npm run build

docker-build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-run:
	docker run --rm -p 3000:3000 $(IMAGE_NAME):$(IMAGE_TAG)

helm-lint:
	helm lint helm/catalog-service

helm-template:
	helm template catalog-service helm/catalog-service -n $(NAMESPACE) -f helm/catalog-service/values-dev.yaml

helm-install:
	kubectl create namespace $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	helm upgrade --install catalog-service helm/catalog-service -n $(NAMESPACE) -f helm/catalog-service/values-dev.yaml --set image.repository=$(IMAGE_NAME) --set image.tag=$(IMAGE_TAG) --set image.pullPolicy=Never

port-forward:
	kubectl port-forward svc/catalog-service 3000:3000 -n $(NAMESPACE)

clean:
	helm uninstall catalog-service -n $(NAMESPACE) || true
	kubectl delete namespace $(NAMESPACE) || true
