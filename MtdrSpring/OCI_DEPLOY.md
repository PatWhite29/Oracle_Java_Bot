# OCI Deployment Guide — Chuva Bot Task Management System

Deploys the Spring Boot monolith (REST API + React frontend + Telegram Bot) to Oracle Cloud Infrastructure using OKE (Kubernetes) and Oracle Autonomous Database.

---

## Prerequisites

- OCI account with sufficient quota (OKE cluster, ADB, OCIR, networking)
- OCI CLI installed and configured (`oci setup config`)
- Docker installed and running locally
- `kubectl` installed
- Terraform installed (used by `setup.sh`)
- A Telegram Bot token from [@BotFather](https://t.me/BotFather)

---

## 1. Clone the Repository

```bash
git clone https://github.com/PatWhite29/Oracle_Java_Bot.git
cd Oracle_Java_Bot
```

---

## 2. Configure Environment Variables

Create a local `env.sh` file (not committed) with your values:

```bash
export DOCKER_REGISTRY=<region>.ocir.io/<tenancy-namespace>/<repo-name>
export TODO_PDB_NAME=<your-adb-name>        # e.g. chuvabot
export OCI_REGION=<region>                  # e.g. us-ashburn-1
export TELEGRAM_BOT_USERNAME=<bot_username> # without @, e.g. ChuvaTaskBot
```

Load them before running any script:

```bash
source env.sh
```

---

## 3. Configure Telegram Bot Token in application.yml

The Telegram bot token is a sensitive value stored in a Kubernetes secret (see step 6). However, if you want to test locally, add it to `application.yml`:

```bash
vi MtdrSpring/backend/src/main/resources/application.yml
```

Set:
```yaml
telegram:
  bot:
    token: <your-bot-token>
    username: <your-bot-username>
```

For OCI deployment the token is injected via the `app-secrets` Kubernetes secret — no change to `application.yml` needed.

---

## 4. Provision Infrastructure with setup.sh

```bash
cd MtdrSpring
./setup.sh
```

`setup.sh` uses Terraform to provision:
- **OKE cluster** — managed Kubernetes cluster
- **Oracle Autonomous Database (ADB)** — wallet downloaded to `./wallet/`
- **OCIR repository** — container image registry
- **VCN and networking** — subnets, security lists, load balancer subnet

The script prompts for:
- OCI compartment OCID
- Database admin password
- Database name

When complete you should see: **SETUP VERIFIED**

If Terraform fails with `CompartmentIdNotFound`, verify your compartment OCID is correct and your OCI CLI config points to the right tenancy.

---

## 5. Configure kubectl

After `setup.sh` completes, configure `kubectl` to talk to the new OKE cluster:

```bash
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-ocid> \
  --file ~/.kube/config \
  --region $OCI_REGION \
  --token-version 2.0.0

kubectl get nodes   # should list cluster nodes
```

---

## 6. Create Kubernetes Secrets

Two secrets must be created manually — they hold sensitive values not stored in source control.

### Database credentials secret

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=ADMIN \
  --from-literal=password=<your-adb-admin-password> \
  -n mtdrworkshop
```

### Application secrets (JWT + Telegram)

```bash
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=<random-256-bit-string> \
  --from-literal=telegram-bot-token=<your-telegram-bot-token> \
  -n mtdrworkshop
```

Generate a safe JWT secret:
```bash
openssl rand -hex 32
```

### Database wallet secret

`setup.sh` typically creates this automatically as `db-wallet-secret`. If it is missing:

```bash
kubectl create secret generic db-wallet-secret \
  --from-file=./wallet \
  -n mtdrworkshop
```

---

## 7. Build and Push the Docker Image

```bash
cd MtdrSpring/backend
source ../../env.sh

# Log in to OCIR
docker login ${OCI_REGION}.ocir.io \
  -u <tenancy-namespace>/<your-oci-username> \
  -p "<your-auth-token>"

./build.sh
```

`build.sh` runs:
1. `./mvnw clean package spring-boot:repackage` — compiles Java and bundles the React frontend
2. `docker build` — builds the container image
3. `docker push` — pushes to OCIR

If `docker push` returns **unauthorized**, regenerate an Auth Token in OCI Console → Identity → Users → Auth Tokens and re-run `docker login`.

---

## 8. Deploy to OKE

```bash
cd MtdrSpring/backend
source ../../env.sh

./deploy.sh
```

`deploy.sh`:
1. Validates required env vars (`DOCKER_REGISTRY`, `TODO_PDB_NAME`, `OCI_REGION`, `TELEGRAM_BOT_USERNAME`)
2. Stamps a timestamped copy of `todolistapp-springboot.yaml` with the actual values
3. Runs `kubectl apply` against the `mtdrworkshop` namespace

---

## 9. Verify Deployment

```bash
kubectl get pods -n mtdrworkshop        # pods should reach Running
kubectl get services -n mtdrworkshop    # find the LoadBalancer external IP
```

The `todolistapp-springboot-service` of type `LoadBalancer` exposes port 80. Once the external IP is assigned (may take 2–3 minutes):

```
http://<external-ip>/
```

The React frontend is served from `/` and the API from `/api/v1/`.

---

## 10. Smoke Test

```bash
# Health check
curl http://<external-ip>/actuator/health

# Register a user
curl -X POST http://<external-ip>/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin","email":"admin@example.com","password":"changeme"}'
```

---

## Troubleshooting

### Terraform: CompartmentIdNotFound
Your OCI CLI profile does not match the compartment OCID. Run `oci iam compartment list` to find valid compartment OCIDs.

### Auth Token failure on docker login
Auth Tokens expire or have limited count per user. Go to OCI Console → Identity → Users → your user → Auth Tokens → Generate New Token.

### Docker push: unauthorized
Ensure you are logged in with `docker login <region>.ocir.io` using the token (not your OCI Console password).

### Pod stuck in ImagePullBackOff
The OCIR image is private. Verify the `imagePullSecrets` or that the OKE node pool has instance principal access to OCIR in the same tenancy.

### Pod stuck in CrashLoopBackOff
Check logs:
```bash
kubectl logs -n mtdrworkshop <pod-name>
```
Common causes: wrong DB_URL, missing wallet, incorrect secret key names.

### Destroy / Reset
To tear down all provisioned OCI resources:
```bash
cd MtdrSpring
./destroy.sh
```
This runs `terraform destroy`. Data in the ADB will be lost.

---

## Environment Variable Reference

| Variable | Source | Description |
|---|---|---|
| `DOCKER_REGISTRY` | env.sh | OCIR registry prefix, e.g. `us-ashburn-1.ocir.io/mytenancy/myrepo` |
| `TODO_PDB_NAME` | env.sh | ADB PDB name used in JDBC TNS alias |
| `OCI_REGION` | env.sh | OCI region identifier |
| `TELEGRAM_BOT_USERNAME` | env.sh | Telegram bot username (no @) |
| `DB_USERNAME` / `DB_PASSWORD` | K8s secret `db-credentials` | ADB credentials |
| `JWT_SECRET` | K8s secret `app-secrets` | 256-bit hex string for JWT signing |
| `TELEGRAM_BOT_TOKEN` | K8s secret `app-secrets` | Token from @BotFather |
