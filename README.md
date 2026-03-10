# 🐾 PetNutrition Recommendation

> **AI-powered pet food recommendation system** — personalized nutrition suggestions for dogs and cats, built with MLOps best practices.

---

## Overview

PetNutrition Recommendation is a full-stack application that uses machine learning to recommend the best pet food based on your pet's breed, age, activity level, health conditions, and nutritional needs. The system combines Content-Based Filtering (CBF) with collaborative filtering (LightFM) to deliver accurate, personalized recommendations.

### Key Features

- 🧠 **ML-Powered Recommendations** — Content-based + LightFM hybrid scoring
- 🐕 **Dog & Cat Support** — Tailored for both species with breed-specific nutrition targets
- ⚖️ **Side-by-Side Food Comparison** — Compare nutritional breakdowns of multiple products
- 📊 **MLflow Experiment Tracking** — Track model experiments and metrics
- 🐳 **Fully Dockerized** — Backend, frontend, ML trainer, and MLflow all containerized
- 🐾 **Pet Profile Management** — Save and manage your pet's profile for quick recommendations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js · TypeScript · CSS |
| **Backend** | FastAPI · Python 3.11 · Uvicorn |
| **ML** | LightFM · scikit-learn · pandas · NumPy |
| **Tracking** | MLflow |
| **Infrastructure** | Docker · Docker Compose · GCP |
| **Data** | JSON mock data (breeds, foods, interactions) |

---

## Project Structure

```
PetNutrition-Recommendation/
├── frontend/               # Next.js web application
│   ├── components/         # Reusable UI components (Layout, etc.)
│   ├── pages/              # Next.js pages
│   │   ├── index.tsx       # Home / landing page
│   │   ├── profile.tsx     # Pet profile form for recommendations
│   │   ├── my-pet.tsx      # Saved pet profile management
│   │   ├── compare.tsx     # Food comparator page
│   │   ├── results/        # Recommendation results
│   │   └── product/        # Product detail pages
│   ├── lib/                # API client
│   └── styles/             # Global CSS design system
│
├── backend/                # FastAPI backend
│   ├── main.py             # App entry point
│   ├── routers/            # API route handlers
│   ├── services/           # Business logic (scoring, matching)
│   ├── schemas.py          # Pydantic request/response models
│   ├── ml_model/           # Model loading & serving
│   ├── data/               # JSON data (breeds, foods, interactions)
│   ├── tests/              # pytest test suite (41 tests)
│   └── Dockerfile
│
├── ml/                     # ML training pipeline
│   ├── trainer.py          # Experiment runner (CBF + LightFM)
│   ├── features.py         # Feature encoding & CBF scorer
│   ├── evaluator.py        # Recommendation metrics
│   ├── mock_generator.py   # Deterministic mock data generator
│   ├── report_generator.py # HTML evaluation report builder
│   ├── docker-compose.yml  # Orchestration for all services
│   ├── Dockerfile          # ML trainer image
│   └── Dockerfile.mlflow   # MLflow tracking server image
│
├── VM_setup.md             # GCP VM Docker setup guide
└── requirements.txt        # Root Python dependencies
```

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)

### 1. Clone the Repository

```bash
git clone https://github.com/kidIIoneIIbit/PetNutrition-Recommendation.git
cd PetNutrition-Recommendation
```

### 2. Start All Services (Docker)

```bash
cd ml
docker compose up --build -d
```

This starts:
- **Backend API** on `http://localhost:8000` (Swagger: `/docs`)
- **MLflow UI** on `http://localhost:5000`
- **ML Trainer** — runs experiments and saves the model

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/breeds?species=dog` | List breeds by species |
| `GET` | `/foods?species=cat` | List foods by species |
| `POST` | `/recommendations/` | Get personalized food recommendations |
| `POST` | `/compare` | Compare multiple foods side-by-side |
| `GET` | `/model/info` | Model version & metadata |

### Example — Get Recommendations

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
    "top_k": 5
  }'
```

---

## ML Pipeline

The ML pipeline runs 4 experiments, tracked via MLflow:

| Experiment | Model | Description |
|-----------|-------|-------------|
| **Exp 1** | CBF Baseline | Content-based filtering using nutritional matching |
| **Exp 2** | LightFM WARP (32d, 30ep) | Collaborative filtering with item features |
| **Exp 3** | LightFM WARP (64d, 50ep) | Higher-dimensional collaborative filtering |
| **Exp 4** | LightFM BPR (32d, 30ep) | Bayesian personalized ranking variant |

The best-performing model is automatically saved to `backend/ml_model/model.pkl`.

### Run Trainer Manually

```bash
cd ml
docker compose up --build trainer
```

---

## Testing

### Backend Tests (41 tests)

```bash
cd ml
docker compose run --rm backend pytest tests/ -v
```

### With Coverage

```bash
docker compose run --rm backend pytest tests/ -v --cov=. --cov-report=term-missing
```

See [`backend/TESTING_BACKEND.md`](backend/TESTING_BACKEND.md) for full details.

### ML Pipeline Tests

See [`ml/TESTING.md`](ml/TESTING.md) for comprehensive ML testing guide.

---

## Documentation

| Document | Description |
|----------|-------------|
| [`VM_setup.md`](VM_setup.md) | GCP VM setup guide (Docker, firewall, MLflow) |
| [`backend/TESTING_BACKEND.md`](backend/TESTING_BACKEND.md) | Backend API testing guide |
| [`ml/TESTING.md`](ml/TESTING.md) | ML pipeline testing & verification guide |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_USE_GCS` | `false` | Set `true` to load model from GCS |
| `MODEL_GCS_BUCKET` | `petrecommend-model-store` | GCS bucket name |
| `MODEL_GCS_BLOB` | `models/model.pkl` | Blob path in bucket |
| `MODEL_LOCAL_PATH` | `backend/ml_model/model.pkl` | Local model path |

---

## License

This project is developed as part of an MLOps course project (2-2025).
Junior student in School of Information Technology, King Mongkut's Institute of Technology Ladkrabang.

---

## Members

- Krithiran Pichayapakbunyakorn 66070005
- Natthawee Naewkampol 66070066
- Phubet Khamkanist 66070160
- Asia Onprom 66070324