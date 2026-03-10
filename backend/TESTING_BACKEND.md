# Backend Testing Guide

> The backend runs inside Docker. All commands use `docker compose` from the `ml/` directory.

---

## 1. Start the Backend Container

```bash
cd ml
sg docker -c 'docker compose up --build -d backend'
```

This builds `backend/Dockerfile` (python:3.11-slim + `requirements.txt`) and starts the API on port 8000.

Verify it's running:
```bash
sg docker -c 'docker ps'
sg docker -c 'docker logs ml-backend-1 -f'
```

---

## 2. Run All Tests (inside container)

```bash
cd ml
sg docker -c 'docker compose run --rm backend pytest tests/ -v'
```

---

## 3. Run with Coverage (inside container)

```bash
sg docker -c 'docker compose run --rm backend pytest tests/ -v --cov=. --cov-report=term-missing'
```

To generate an HTML coverage report:

```bash
sg docker -c 'docker compose run --rm backend pytest tests/ --cov=. --cov-report=html'
# Output written to backend/htmlcov/index.html (via volume mount)
```

---

## 4. Run a Single Test File (inside container)

```bash
sg docker -c 'docker compose run --rm backend pytest tests/test_endpoints_get.py -v'
sg docker -c 'docker compose run --rm backend pytest tests/test_recommend.py -v'
sg docker -c 'docker compose run --rm backend pytest tests/test_model_service.py -v'
sg docker -c 'docker compose run --rm backend pytest tests/test_compare.py -v'
sg docker -c 'docker compose run --rm backend pytest tests/test_nutrition.py -v'
sg docker -c 'docker compose run --rm backend pytest tests/test_match_logic.py -v'
```

---

## 5. Test Coverage by File

| File | What it tests |
|---|---|
| `test_endpoints_get.py` | `GET /health`, `/breeds`, `/foods`, `/model` endpoints |
| `test_recommend.py` | `POST /recommendations/` — dog/cat profiles, top_k, invalid breed |
| `test_compare.py` | `POST /compare` — 2 foods, 3 foods, nonexistent food, winner logic |
| `test_model_service.py` | `ModelService` init, `recommend()`, `get_model_info()` |
| `test_nutrition.py` | Nutrition scoring logic — boundary, clamping, reasons |
| `test_match_logic.py` | Match score logic — tag overlap, rating, fat control |
| `test_data_loader.py` | `load_breeds()` and `load_foods()` return correct structure |

**Total: 41 test functions**

---

## 6. Access the API (manual testing)

Once the backend container is running:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

Key endpoints to test manually:

| Method | URL | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/breeds?species=dog` | List dog breeds |
| GET | `/foods?species=cat` | List cat foods |
| POST | `/recommendations/` | Get food recommendations |
| POST | `/compare` | Compare multiple foods |
| GET | `/model/info` | Model version + metadata |

---

## 7. Sample Request — Recommendations

```bash
curl -X POST http://localhost:8000/recommendations/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "breed_id": "labrador_retriever",
    "age_years": 4,
    "weight_kg": 30,
    "activity_level": "moderate",
    "health_conditions": ["joint"],
    "top_k": 3
  }'
```

---

## 8. Troubleshooting

### `docker: permission denied`
Your shell session hasn't picked up the docker group yet:
```bash
newgrp docker
# then retry
```

### `uvicorn: command not found` (running on host directly)
All dependencies live inside the container. Run via Docker instead:
```bash
cd ml
sg docker -c 'docker compose up --build -d backend'
```
Or install manually on the host:
```bash
pip3 install -r backend/requirements.txt
cd backend && python3 -m uvicorn main:app --reload
```

### `ModuleNotFoundError` when running pytest
Always run pytest via `docker compose run` from `ml/`, not directly on the host:
```bash
cd ml
sg docker -c 'docker compose run --rm backend pytest tests/ -v'
```

### Model not loaded (`MODEL_USE_GCS=false`)
By default the model loads from `ml_model/model.pkl` (local file, via volume mount).  
Make sure the trainer has run first so `backend/ml_model/model.pkl` exists.  
To use GCS instead, edit `ml/docker-compose.yml` under the `backend` service:
```yaml
environment:
  - MODEL_USE_GCS=true
  - MODEL_GCS_BUCKET=petrecommend-model-store
```
Then restart the container:
```bash
sg docker -c 'docker compose up -d backend'
```

### Rebuild after changing `requirements.txt` or `Dockerfile`
```bash
cd ml
sg docker -c 'docker compose up --build -d backend'
```
