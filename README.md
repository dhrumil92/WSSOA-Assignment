# Lab 8: Kubernetes, Basic CI/CD & Monitoring

## 1. Application Overview and Lab 7 Starting Point
This project builds upon the Lab 7 application, which consists of a microservices architecture for "CampusConnect". It includes an API Gateway as the entry point, and backend services: User Service, Product Service, and Order Service. The database used is a managed MongoDB Atlas instance.

## 2. Prerequisites and Kubernetes Environment
- **Environment:** Docker Desktop with local Kubernetes cluster (kind).
- **Prerequisites:** Docker, kubectl, Postman, and a GitHub repository for CI/CD.

## 3. How to Access the Cluster/Context
To check the current context and ensure the cluster is active, use:
``bash
kubectl config current-context
kubectl get nodes
``

## 4. How to Apply Manifests and Verify Resources
All Kubernetes manifests are located in the k8s/ directory.
To apply them to the lab8 namespace:
``bash
kubectl create namespace lab8
kubectl apply -f k8s/ -n lab8
``
To verify the resources:
``bash
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8
``

## 5. How to Access/Test the Gateway
To test the API Gateway, we port-forward the service to our local machine:
``bash
kubectl port-forward svc/api-gateway 3000:3000 -n lab8
``
Then, we use Postman to send a GET request to http://localhost:3000/users to verify service communication.

## 6. Scaling and Self-Healing Commands
To scale the User Service to 3 replicas:
``bash
kubectl scale deployment user-service --replicas=3 -n lab8
``
To demonstrate self-healing, delete one of the User Service pods:
``bash
kubectl delete pod <user-service-pod-name> -n lab8
``
Kubernetes will automatically spin up a replacement pod to maintain the desired state.

## 7. GitHub Actions Workflow Description
A GitHub Actions workflow is located at .github/workflows/ci.yml. It triggers on a push to the main branch. The workflow uses an ubuntu-latest runner to checkout the code, install dependencies using 
pm ci, and run a basic Docker build to test image creation for the API Gateway.

## 8. Prometheus Target/Metric Information
Prometheus is deployed and configured via a ConfigMap to scrape metrics from the API Gateway on port 3000 at the /metrics path. The API Gateway exposes standard Node.js metrics (e.g., http_requests_total) using the express-prometheus-middleware.

## 9. Grafana Dashboard and Monitored Metrics
Grafana is connected to the Prometheus data source. A dashboard is created to monitor the API Gateway's traffic, specifically using the PromQL query ate(http_requests_total[5m]) to track the request rate over a 5-minute window.

## 10. Configuration Names without Exposing Secrets
- **ConfigMap:** pp-config (Used to store the MongoDB URI and internal service URLs).
- **ConfigMap:** prometheus-config (Used to supply prometheus.yml configuration).
No secrets or database passwords are committed to the repository.

## 11. Troubleshooting Notes and Evidence References
During the lab, we encountered issues with Docker Desktop's image cache (ErrImageNeverPull). To troubleshoot:
``bash
kubectl describe pod <pod-name> -n lab8
kubectl logs <pod-name> -n lab8
``
We resolved the issue by mounting the updated server.js code via a ConfigMap directly into the API Gateway pod and using an overridden startup command (
pm install express-prometheus-middleware prom-client && node server.js) to dynamically load the metrics packages. Evidence of the successful deployment and monitoring can be found in the attached screenshots (1 through 13).
