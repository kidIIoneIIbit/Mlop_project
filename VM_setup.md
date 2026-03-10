# VM Docker Setup Guide

> **For team members setting up the ML training environment on a fresh GCP VM (Ubuntu 22.04).**

---

## 1. Install Docker

```bash
# Remove any conflicting packages first
sudo apt-get remove -y docker.io docker-compose containerd containerd.io 2>/dev/null || true

# Install Docker (Ubuntu's official packages)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# Verify daemon is running
sudo systemctl enable --now docker
sudo systemctl is-active docker     # should print: active
```

---

## 2. Add Your User to the docker Group

This lets you run `docker` without `sudo`.

```bash
sudo usermod -aG docker $USER
```

**Important:** The change only takes effect in a **new** shell session.  
Either log out and log back in, or run this in the current terminal:

```bash
newgrp docker
```

Verify it worked:

```bash
docker ps   # should return an empty table, not a permission error
```

---

## 3. Clone the Repo

```bash
git clone https://github.com/kidIIoneIIbit/PetNutrition-Recommendation.git
cd PetNutrition-Recommendation
```

---

## 4. Run the ML Trainer

All commands are run from the `ml/` directory.

```bash
cd ml

# Build image and run trainer (logs to terminal)
docker compose up --build

# Or run in background
docker compose up --build -d
docker logs ml-trainer-1 -f     # follow logs
```

This will:
- Build `python:3.11-slim` with `gcc/g++` + all Python deps (LightFM compiles here)
- Run `python trainer.py --final`
- Write trained model to `backend/ml/model.pkl`
- Write MLflow runs to `ml/mlruns/`
- Write experiment JSON report to `reports/experiment_results.json`

Stop the container:

```bash
docker compose down
```

---

## 5. Volume Mount Layout

| Host path (relative to repo root) | Container path | Purpose |
|---|---|---|
| `backend/` | `/app/backend` | Data files (`breeds.json`, `foods.json`, `interactions.json`) + model output |
| `reports/` | `/app/reports` | Experiment result JSON |
| `ml/` | `/app/ml` | Source code + `mlruns/` |

---

## 6. Troubleshooting

### Permission denied on docker.sock

Your shell hasn't picked up the new group yet. Run:

```bash
newgrp docker
# then retry your command
```

### `containerd.io` conflicts with `containerd`

Do not mix Docker's official repo (`docker-ce`) with Ubuntu's repo (`docker.io`) packages. Use only one install path. If you see conflict errors:

```bash
sudo apt-get remove -y containerd.io docker-ce docker-ce-cli
sudo apt-get install -y docker.io docker-compose-plugin
```

### `FileNotFoundError: .../backend/data/breeds.json`

The `backend/` directory is not mounted. Make sure you run `docker compose up` from `ml/` (not from the repo root), so relative paths in `docker-compose.yml` resolve correctly.

```bash
cd /path/to/PetNutrition-Recommendation/ml
docker compose up --build
```

### Rebuild after code changes

```bash
docker compose up --build
```

Changes to `.py` files or `requirements.txt` are automatically picked up on rebuild.

---

## 7. MLflow Tracking Server (Phase 3)

The `docker-compose.yml` includes a dedicated MLflow service that the trainer logs to.

```bash
cd ml

# Start MLflow server + trainer together
docker compose up --build -d

# MLflow UI is now available at:
#   http://localhost:5000          (from inside the VM)
#   http://<VM_EXTERNAL_IP>:5000   (from your browser, after firewall is open)

# Follow MLflow server logs
docker logs ml-mlflow-1 -f

# Follow trainer logs
docker logs ml-trainer-1 -f

# Start only the MLflow server (without re-running the trainer)
docker compose up -d mlflow
```

---

## 8. Open Firewall Port 5000

The VM's service account may not have the `compute` API scope, so `gcloud` commands run **from inside the VM** may fail with:

```
ERROR: Request had insufficient authentication scopes.
```

Use one of these alternatives instead:

### Option A: Run gcloud from your local machine

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud compute firewall-rules create allow-mlflow \
  --allow tcp:5000 \
  --description "Allow MLflow UI on port 5000" \
  --direction INGRESS
```

### Option B: GCP Console UI (no CLI needed)

1. GCP Console → **VPC Network → Firewall**
2. Click **Create Firewall Rule**
3. Fill in:
   - Name: `allow-mlflow`
   - Direction: Ingress
   - Action: Allow
   - Targets: **All instances in the network** (see note below)
   - Source IP ranges: `0.0.0.0/0`
   - Protocols/ports: `tcp:5000`
4. Click **Create**

> **Important — Targets:** If you set *Specified target tags* (e.g. `mlflow`), you must also add that tag to your VM:
> GCP Console → Compute Engine → VM → Edit → **Network tags** → add `mlflow` → Save.
> Without the matching tag the rule has no effect and the port stays closed.

### Option C: Fix VM API scopes (requires VM restart)

1. Stop the VM
2. GCP Console → VM → Edit → **Access scopes** → "Allow full access to all Cloud APIs"
3. Save → Start VM
4. Run `gcloud compute firewall-rules create ...` from inside the VM

---

## 9. Can't Access MLflow from Browser (but localhost works)

If `http://localhost:5000` works but `http://<VM_EXTERNAL_IP>:5000` does not:

**Step 1 — Confirm Docker is binding to all interfaces:**
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
# Should show: 0.0.0.0:5000->5000/tcp
# If it shows: 127.0.0.1:5000->5000/tcp  →  rebuild with docker compose up --build
```

**Step 2 — Confirm the firewall rule is active:**
```bash
# From local machine:
gcloud compute firewall-rules describe allow-mlflow
# Check: "network" matches your VM's network (usually "default")
# Check: "targetTags" — if set, your VM must have that tag (see Section 8)
```

**Step 3 — Add tag to VM if needed:**
```bash
# From local machine:
gcloud compute instances add-tags YOUR_VM_NAME \
  --tags mlflow \
  --zone YOUR_ZONE
```

After the rule is active the UI is accessible at `http://<VM_EXTERNAL_IP>:5000`.

---

## 10. Upload Trained Model to GCS

After training, the model is saved locally at `backend/ml_model/model.pkl`. To make it available to other environments (e.g., production backend), upload it manually to Google Cloud Storage.

### Upload using gsutil (from local machine or VM with proper scopes)

```bash
# Upload the latest model
gsutil cp backend/ml_model/model.pkl gs://petrecommend-model-store/models/model.pkl

# Upload a versioned copy (replace vN with actual version)
gsutil cp backend/ml_model/model_v3.pkl gs://petrecommend-model-store/models/model_v3.pkl

# Upload the final model (if trained with --final)
gsutil cp backend/ml_model/model_v3_final.pkl gs://petrecommend-model-store/models/model_v3_final.pkl
```

### List models in the bucket

```bash
gsutil ls -l gs://petrecommend-model-store/models/
```

### (Optional) Enable auto-upload from trainer

If your VM has the correct API scopes (see Section 8, Option C), you can enable auto-upload by setting the environment variable in `ml/docker-compose.yml`:

```yaml
trainer:
  environment:
    - MODEL_UPLOAD_GCS=true
```

> **Note:** The VM must have **Storage Object Admin** permission. If you get a 403 error, fix the VM API scopes first (see Section 8, Option C).
