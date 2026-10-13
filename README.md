# Lab 8: Kubernetes, CI/CD & Monitoring

## 1. Application Overview and Lab 7 Starting Point
This project builds upon the Lab 7 application, which implements a microservices architecture for "CampusConnect". It includes an API Gateway as the single client entry point, and three backend services: User Service, Product Service, and Order Service. The database used is a managed MongoDB Atlas instance.

## 2. Prerequisites and Kubernetes Environment
- **Environment:** Docker Desktop with Kubernetes enabled / local cluster (kind).
- **Prerequisites:** Docker, kubectl, Postman, Prometheus, Grafana, and GitHub repository for CI/CD.

## 3. How to Access the Cluster/Context
To check the active context and ensure cluster nodes are available:
```bash
kubectl config current-context
kubectl get nodes
```

## 4. How to Apply Manifests and Verify Resources
All Kubernetes manifests are organized in the `k8s/` directory.

To apply them to the `lab8` namespace:
```bash
kubectl create namespace lab8
kubectl apply -f k8s/ -n lab8
```

To verify the running state of resources:
```bash
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8
```

### 4.1 Health & Readiness Probes (Section 3.3.1)
Liveness and readiness probes are configured on the API Gateway and backend services using the `/health` endpoint:
- **Liveness Probe:** Checks if the container process is alive and responsive. If the probe fails, Kubernetes automatically restarts the pod.
- **Readiness Probe:** Checks if the application is fully initialized and ready to receive live incoming traffic. During rollouts and startup, traffic is only routed once the probe passes.

**Manifest Probe Configuration Example:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

## 5. How to Access and Test the Gateway
The API Gateway is exposed using a `NodePort` service on port `30000` (and can also be accessed via port-forwarding):
```bash
kubectl port-forward svc/api-gateway 3000:3000 -n lab8
```
Send requests using Postman to `http://localhost:3000/users`, `http://localhost:3000/products`, or `http://localhost:3000/orders`. The Gateway routes requests internally to the target Kubernetes Service name (e.g. `http://user-service:3001`).

## 6. Scaling and Self-Healing
### Scaling:
To scale the User Service from 1 replica to 3 replicas:
```bash
kubectl scale deployment user-service --replicas=3 -n lab8
kubectl get pods -n lab8
```
The Kubernetes Service `user-service` acts as a stable internal endpoint, load balancing requests across all 3 healthy pods.

### Self-Healing:
To verify self-healing, manually delete one of the User Service pods:
```bash
kubectl delete pod <user-service-pod-name> -n lab8
kubectl get pods -n lab8
```
Kubernetes immediately detects the drift from desired state (3 replicas) and provisions a replacement pod, which transitions to `Running` and `Ready` once its readiness probe succeeds.

## 7. GitHub Actions CI/CD Workflow & Container Registry
The automated pipeline is defined in `.github/workflows/ci.yml`.

### End-to-End Workflow Stages:
`Git Push → Build/Test → Docker Image → Container Registry (GHCR) → Kubernetes Deployment Rollout → Verification`

### Container Registry & Versioned Tagging (Section 4.2):
- **Registry:** GitHub Container Registry (`ghcr.io`).
- **Traceable Tagging:** Every image is tagged with the exact Git commit SHA (`${{ github.sha }}`) along with `:latest`.
- **Image build & push command:**
  ```bash
  docker build -t ghcr.io/<owner>/campusconnect-api-gateway:${GITHUB_SHA} ./api-gateway
  docker push ghcr.io/<owner>/campusconnect-api-gateway:${GITHUB_SHA}
  ```

### Kubernetes Rolling Update / Rollout Procedure:
To deploy the newly versioned image into Kubernetes:
```bash
kubectl set image deployment/api-gateway api-gateway=ghcr.io/<owner>/campusconnect-api-gateway:<image-tag> -n lab8
kubectl rollout status deployment/api-gateway -n lab8
```
Kubernetes executes a zero-downtime rolling update, deploying replacement pods and waiting for readiness probes before terminating previous pods.

## 8. Monitoring with Prometheus & Grafana
- **Monitoring Flow:** `Application (/metrics) → Prometheus scrape → Target UP → PromQL → Grafana Dashboard`
- **Prometheus Scrape Configuration:** Configured via ConfigMap to scrape target `gateway-service:3000` on path `/metrics`.
- **Metrics Exposure:** The API Gateway uses `express-prometheus-middleware` and `prom-client` to expose metrics.

### Application vs. Infrastructure Metrics (Section 5.2.1):
- **Application Metrics:** Track HTTP request rates, response codes, latency, and throughput (`rate(http_requests_total[5m])`, `http_request_duration_seconds_bucket`).
- **Infrastructure Metrics:** Track cluster node health, Pod CPU usage, memory consumption, and restart counts.
- **Grafana Dashboard:** Displays the Gateway request rate in real time, showing clear traffic spikes when requests are dispatched from Postman.

## 9. Configuration & Secret Management
To follow cloud-native security best practices and prevent credentials from being exposed:
- **`app-config` (ConfigMap):** Stores non-sensitive service discovery URLs (`USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL`).
- **`mongodb-secret` (Secret):** Stores the sensitive MongoDB Atlas URI credentials, referenced securely by deployments via `secretKeyRef`:
  ```yaml
  env:
  - name: MONGODB_URI
    valueFrom:
      secretKeyRef:
        name: mongodb-secret
        key: MONGODB_URI
  ```
No database passwords or secret keys are committed to GitHub.

## 10. Troubleshooting Notes & Evidence
- **ErrImageNeverPull / Image Cache:** Resolved by loading local images into the cluster nodes or pulling directly from GitHub Container Registry.
- **Probe startup delays:** Tuned `initialDelaySeconds: 5` to give Node.js processes adequate time to establish MongoDB connections before readiness checks run.
- **Screenshots:** Evidence screenshots 1 through 13 validate all required deliverables (manifests, deployments, scaling, self-healing, CI/CD pipeline, Prometheus targets, Grafana dashboard, and traffic observation).

---

## 11. Submission Checklist (Revised Lab 8)
- [x] Lab 7 application verified.
- [x] Kubernetes context/node verified.
- [x] `lab8` namespace created and used.
- [x] Gateway/User/Product/Order Deployments and Services created.
- [x] Health & Readiness probes (`livenessProbe`, `readinessProbe`) configured and pods reporting `Ready`.
- [x] ConfigMap and Secrets (`mongodb-secret`) used appropriately without hardcoded passwords.
- [x] Application deployed and verified.
- [x] Gateway tested from Postman.
- [x] User Service scaled to 3 replicas.
- [x] Self-healing demonstrated (pod deletion and recovery).
- [x] GitHub Actions CI/CD workflow passed with versioned tagging (`${{ github.sha }}`).
- [x] Container registry delivery documented.
- [x] Kubernetes image rollout procedure verified.
- [x] Prometheus targets (`UP`) and metrics verified.
- [x] Grafana dashboard created and responding to API traffic.
- [x] Application vs. Infrastructure metrics documented.
- [x] README updated.
