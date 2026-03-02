# 🐾 Pet Lifestyle & Nutrition Recommender
## Group Work Assignment — 4-Person Split Plan

> **Division Method:** By Technical Layer  
> **Team Size:** 4 people (equal skill level)  
> **Timeline:** 1 – 1.5 Weeks (11 Days)  
> **Submission:** Live Demo (GCP) · GitHub Repo · Report · Slides · MLflow Results

---

## 👥 Team Overview

| Person | Layer | Primary Responsibility |
|---|---|---|
| **Person A** | 🎨 Frontend | Next.js UI — Pet Profile Builder, Results Page, Food Comparison |
| **Person B** | ⚙️ Backend | FastAPI Server — Endpoints, Schemas, Business Logic |
| **Person C** | 🧠 ML / Data | LightFM Model — Data Generation, Feature Engineering, Training, MLflow |
| **Person D** | ☁️ DevOps / Docs | GCP Deployment, CI/CD, Docker, Report, Slides |

> **Shared responsibility:** Everyone contributes to the final presentation and report. Person D leads but all members write their own section.

---

## 📊 Workload Balance Check

| Person | Core Tasks | Shared Tasks | Total Effort |
|---|---|---|---|
| Person A | 12 tasks | 4 tasks | ~16 tasks |
| Person B | 11 tasks | 4 tasks | ~15 tasks |
| Person C | 13 tasks | 4 tasks | ~17 tasks |
| Person D | 10 tasks | 4 tasks | ~14 tasks |

> Person C carries slightly more in Week 1 (ML setup is heavier early); Person D carries more in Week 2 (deployment + docs). This balances out overall.

---

## 🗓️ Day-by-Day Timeline

```
Day  1  2  3  4  5  6  7  8  9  10  11
     ├──┤  ├──┤  ├──────────┤  ├───┤  ├────┤
A    [Setup ][Profile Form ][Results+Compare][Polish]
B    [Setup ][Endpoints    ][API Complete   ][Tests ]
C    [Data  ][Model Train  ][MLflow+Eval    ][Report]
D    [Setup ][Docker       ][GCP Deploy     ][Slides]
              │              │
            Sync #1        Sync #2         Final Demo
           (End Day 3)   (End Day 7)      (Day 11)
```

### 🔁 Three Sync Checkpoints (All 4 Members)
| Checkpoint | Day | Agenda |
|---|---|---|
| **Sync #1** | End of Day 3 | Verify APIs are callable from frontend, data schemas agreed |
| **Sync #2** | End of Day 7 | Full local end-to-end demo works, prep for GCP |
| **Final Sync** | Day 10 | Live URL test, rehearse presentation, finalize report |

---

## 🎨 Person A — Frontend

### Role Summary
Owns the entire Next.js application. Responsible for all UI components, user flows, API integration, and mobile responsiveness.

### Tech Owned
- Next.js 14 + TypeScript
- Tailwind CSS
- Axios (API client)
- `/frontend` directory

---

### Day 1–2 · Project Setup
- [ ] Initialise Next.js 14 project with TypeScript (`npx create-next-app`)
- [ ] Configure Tailwind CSS
- [ ] Set up folder structure: `/pages`, `/components`, `/lib`
- [ ] Create `lib/api.ts` — Axios client pointing to FastAPI (`NEXT_PUBLIC_API_URL`)
- [ ] Create placeholder pages: `index.tsx`, `results/[petId].tsx`, `compare.tsx`
- [ ] Write `Dockerfile` for Next.js (hand off to Person D by Day 2 EOD)

### Day 3–4 · Pet Profile Builder
- [ ] Build `SpeciesToggle` component — Dog 🐶 / Cat 🐱 buttons
- [ ] Build `BreedSelector` component — dropdown filtered by species (calls `GET /breeds/{species}`)
- [ ] Build `PetDetailsForm` — age, weight, activity level inputs with validation
- [ ] Build `HealthConditionPicker` — multi-select chip component (joint, skin, kidney, etc.)
- [ ] Build `BreedInsightBanner` — shows calorie range + common issues after breed selected (calls `GET /breeds/{species}/{breed_id}`)
- [ ] Wire form submit → `POST /recommend` → navigate to results page

### Day 5–6 · Recommendations & Nutrition Score
- [ ] Build `RecommendationCard` component — food name, brand, type (dry/wet), badges
- [ ] Build `MatchScoreBar` — animated percentage bar (green ≥85%, amber 70–84%, red <70%)
- [ ] Build `NutritionPills` — protein / fat / fiber / kcal displayed vs. breed targets
- [ ] Build `MatchReasonChips` — "Why recommended" explanation chips (max 3)
- [ ] Build results page grid (6 cards, loading skeleton while API responds)
- [ ] Add checkbox selection on cards (max 3) for comparison

### Day 7 · Food Comparison Feature
- [ ] Build `FoodComparator` component — side-by-side table for up to 3 selected foods
- [ ] Highlight best value per row (lowest price, highest protein, etc. in green)
- [ ] Add "Best Match" winner banner at top of comparison table
- [ ] Wire compare button → `POST /compare` → render comparison table below results
- [ ] Mobile responsive pass on all pages

### Day 8–9 · Integration & Polish
- [ ] Test all API calls against live GCP backend URL (coordinate with Person D)
- [ ] Handle all error states — API down, no recommendations found, network error
- [ ] Add loading skeletons on all data-fetching components
- [ ] Cross-browser test (Chrome, Safari, Firefox)
- [ ] Final UI polish pass

### Day 10–11 · Wrap Up
- [ ] Fix any bugs found in final demo run
- [ ] Write **Frontend section of the report** (UI design decisions, component structure, screenshots)
- [ ] Prepare 2–3 slides covering UI demo walkthrough

### Person A Deliverables
- ✅ `/frontend` — fully functional Next.js app
- ✅ `Dockerfile` for frontend container
- ✅ All 3 features working: Profile Builder, Recommendations, Food Comparison
- ✅ Frontend section of project report
- ✅ UI demo slides (2–3 slides)

---

## ⚙️ Person B — Backend

### Role Summary
Owns the entire FastAPI server. Responsible for all API endpoints, request/response schemas, business logic (match score calculation), and unit tests.

### Tech Owned
- FastAPI + Python 3.11
- Pydantic (schemas)
- Pytest (testing)
- `/backend` directory

---

### Day 1–2 · Project Setup
- [ ] Initialise Python project with `pyproject.toml` and virtual environment
- [ ] Install dependencies: `fastapi`, `uvicorn`, `pydantic`, `pytest`, `httpx`, `python-dotenv`
- [ ] Create `main.py` — FastAPI app with CORS configured for frontend URL
- [ ] Define all Pydantic schemas in `schemas.py`:
  - `PetProfileRequest`
  - `RecommendationResponse`
  - `FoodItem`, `BreedInfo`, `NutritionGapAnalysis`
  - `CompareRequest`, `CompareResponse`
- [ ] Set up router structure: `/routers/recommendations.py`, `/routers/foods.py`, `/routers/breeds.py`, `/routers/compare.py`
- [ ] `GET /health` endpoint returning `{ "status": "ok", "version": "1.0.0" }`

### Day 3–4 · Core Endpoints
- [ ] `GET /breeds/{species}` — returns list of breeds from `breeds.json`
- [ ] `GET /breeds/{species}/{breed_id}` — returns breed detail + nutritional targets
- [ ] `GET /foods` — returns all food products (query params: `species`, `type`, `tag`)
- [ ] `GET /foods/{food_id}` — returns full food product detail
- [ ] `GET /model/info` — returns current model version + last trained metrics
- [ ] Load `breeds.json` and `foods.json` on startup (coordinate schema with Person C)

### Day 5–6 · Recommendation & Compare Endpoints
- [ ] `POST /recommend` — receives `PetProfileRequest`, calls ML model (coordinate with Person C on model interface), returns ranked `RecommendationResponse`
- [ ] Implement `nutrition_gap_analysis` — compares food nutrients vs. breed minimums
- [ ] Implement `breed_insights` enrichment — appends calorie range, common issues to response
- [ ] `POST /compare` — receives list of food IDs + pet profile, returns side-by-side comparison with winner logic
- [ ] Add `match_reasons` logic — generates human-readable explanation strings per recommendation

### Day 7 · Testing & Docs
- [ ] Write pytest unit tests for:
  - `nutrition_gap_analysis` function
  - `match_reasons` logic
  - All GET endpoints (assert status 200, correct schema)
  - `POST /recommend` with 3 pet profiles (Labrador, Persian, Sphynx)
  - `POST /compare` with 3 food IDs
- [ ] Verify FastAPI auto-generates OpenAPI docs at `/docs` correctly
- [ ] Write `requirements.txt` final version

### Day 8–9 · Integration Support
- [ ] Coordinate with Person A — confirm all response shapes match frontend expectations
- [ ] Coordinate with Person C — confirm model `.pkl` loads correctly and returns expected types
- [ ] Fix any schema mismatches found during integration testing
- [ ] Add request logging middleware for debugging

### Day 10–11 · Wrap Up
- [ ] Fix bugs from final demo
- [ ] Write **Backend section of the report** (API design, endpoint documentation, testing results)
- [ ] Prepare 1–2 slides covering API architecture and endpoint design

### Person B Deliverables
- ✅ `/backend` — fully functional FastAPI server
- ✅ All 8 endpoints implemented and tested
- ✅ Pytest suite with ≥80% coverage on core logic
- ✅ OpenAPI docs at `/docs`
- ✅ Backend section of project report
- ✅ API architecture slides (1–2 slides)

---

## 🧠 Person C — ML / Data

### Role Summary
Owns all machine learning and data work. Responsible for mock data generation, feature engineering, model training (CBF + LightFM), MLflow experiment tracking, and model evaluation.

### Tech Owned
- LightFM 1.17
- MLflow 2.x
- Faker (mock data)
- NumPy, Pandas, SciPy
- `/ml` directory, `/backend/data`, `/backend/ml`

---

### Day 1–2 · Mock Data Generation
- [ ] Write `mock_generator.py` using Faker with `SEED=42` for reproducibility
- [ ] Generate `breeds.json` — 11 dog breeds + 10 cat breeds with full nutritional targets schema:
  ```
  id, name, species, size, weight_range_kg, life_expectancy_years,
  weight_tendency, common_health_issues, nutritional_targets (protein_min, fat_min, fiber_min, calorie_range)
  ```
- [ ] Generate `foods.json` — 24 products (12 dog, 12 cat) with full schema:
  ```
  id, name, brand, species, food_type, nutritional_content, tags, certifications, badges, price_usd, avg_rating
  ```
- [ ] Generate `interactions.json` — 200 mock users × 5–15 ratings each (seeded, reproducible)
- [ ] Validate data: no null fields, all species references valid, protein/fat/fiber values realistic
- [ ] Share final schemas with Person B (Pydantic) and Person A (TypeScript types) by **Day 2 EOD**

### Day 3–4 · Feature Engineering & Baseline
- [ ] Build `features.py` — encode pet profile + food features as LightFM side feature vectors:
  - Pet features: species, size, age_group, activity_level, health_condition flags
  - Food features: food_type, main_ingredient, tag flags, protein_bin, fat_bin
- [ ] Build content-based scoring function (`cbf_score`) as baseline
- [ ] Build LightFM `Dataset` — map user IDs, item IDs, and side features
- [ ] 80/20 train/test split on interactions
- [ ] Run **Experiment 1 (Baseline):** CBF only → log Precision@5, NDCG@5 to MLflow

### Day 5–6 · LightFM Training & MLflow
- [ ] Run **Experiment 2:** LightFM WARP, `num_components=32`, `epochs=30` → log all params + metrics
- [ ] Run **Experiment 3:** LightFM WARP, `num_components=64`, `epochs=50` → log all params + metrics
- [ ] Run **Experiment 4:** LightFM BPR, `num_components=32` → log all params + metrics
- [ ] Compare all 4 runs in MLflow UI → identify best model
- [ ] Register best model in MLflow Model Registry as `pet-nutrition-recommender v1`
- [ ] Promote best model to `Production` stage in registry
- [ ] Export comparison table (CBF vs. LightFM) as screenshot for report

### Day 7 · Model Serving Interface
- [ ] Build `model.py` — `RecommendationModel` class wrapping LightFM:
  ```python
  class RecommendationModel:
      def load(path): ...
      def recommend(pet_profile, top_k=6) -> List[ScoredFood]: ...
      def get_model_info() -> dict: ...
  ```
- [ ] Build `evaluator.py` — `precision_at_k()`, `ndcg_at_k()`, `auc_score()` functions
- [ ] Serialize best model to `model.pkl` → upload to Cloud Storage (coordinate with Person D)
- [ ] Write `load_model.py` — downloads `model.pkl` from GCS on app startup
- [ ] Integration test: call `model.recommend()` with 5 different pet profiles, verify output

### Day 8–9 · Evaluation Report
- [ ] Generate full evaluation report (`reports/evaluation_report.html`) — metrics table, precision/recall curves
- [ ] Run final training on full dataset (train + test), save final `model_v1_final.pkl`
- [ ] Verify MLflow server on GCP is recording runs correctly (coordinate with Person D)
- [ ] Confirm model loads correctly from GCS in deployed environment

### Day 10–11 · Wrap Up
- [ ] Write **ML section of the report**:
  - Algorithm comparison (CBF vs. UBCF vs. LightFM) with decision rationale
  - Feature engineering methodology
  - Training results table (all 4 experiments)
  - MLflow experiment screenshots
  - Final model performance metrics
- [ ] Prepare 3–4 slides: algorithm comparison table, MLflow dashboard screenshot, final metrics

### Person C Deliverables
- ✅ `breeds.json`, `foods.json`, `interactions.json` (mock data)
- ✅ `features.py`, `model.py`, `trainer.py`, `evaluator.py`
- ✅ 4 MLflow experiment runs with tracked metrics
- ✅ Best model registered in MLflow Model Registry (`Production` stage)
- ✅ `model_v1_final.pkl` uploaded to Cloud Storage
- ✅ `evaluation_report.html`
- ✅ ML section of project report (algorithm comparison + results)
- ✅ ML/MLflow slides (3–4 slides)

---

## ☁️ Person D — DevOps / Docs

### Role Summary
Owns infrastructure, deployment, CI/CD, and all final documentation. Responsible for making the system run live on GCP, writing the project report, and coordinating the presentation.

### Tech Owned
- Docker + Docker Compose
- Google Cloud (Cloud Run, Cloud Storage, Cloud SQL, Cloud Build, GCE, Artifact Registry)
- MLflow server setup
- `/infra` directory
- Project report & slides

---

### Day 1–2 · Local Environment Setup
- [ ] Write `docker-compose.yml` — spins up frontend (port 3000), backend (port 8000), and MLflow (port 5000) together
- [ ] Confirm `docker-compose up` works with placeholder services
- [ ] Create GCP project `petricommend` and enable required APIs:
  - Cloud Run, Cloud Build, Artifact Registry, Cloud Storage, Cloud SQL, Compute Engine
- [ ] Create Cloud Storage buckets:
  - `petricommend-mlflow-artifacts` (MLflow artifact store)
  - `petricommend-model-store` (model `.pkl` files)
  - `petricommend-data` (mock data JSON files)
- [ ] Write `README.md` skeleton with sections for all team members to fill in

### Day 3–4 · Docker & MLflow Server
- [ ] Collect `Dockerfile` from Person A (frontend) and write `Dockerfile` for backend
- [ ] Build and test both Docker images locally
- [ ] Provision `e2-small` GCE VM in `asia-southeast1` for MLflow server
- [ ] Install MLflow + PostgreSQL client on VM
- [ ] Create Cloud SQL PostgreSQL instance (`mlflow-db`)
- [ ] Start MLflow tracking server on VM:
  ```bash
  mlflow server \
    --backend-store-uri postgresql://user:pass@CLOUD_SQL_IP/mlflow_db \
    --default-artifact-root gs://petricommend-mlflow-artifacts \
    --host 0.0.0.0 --port 5000
  ```
- [ ] Share MLflow server URL with Person C by **Day 4 EOD**

### Day 5–6 · GCP Deployment
- [ ] Push Docker images to Artifact Registry:
  ```bash
  docker build -t gcr.io/petricommend/backend .
  docker push gcr.io/petricommend/backend
  ```
- [ ] Deploy backend to Cloud Run:
  ```bash
  gcloud run deploy petricommend-api \
    --image gcr.io/petricommend/backend \
    --region asia-southeast1 \
    --memory 1Gi --allow-unauthenticated
  ```
- [ ] Deploy frontend to Cloud Run with `NEXT_PUBLIC_API_URL` env var set to backend URL
- [ ] Test live URLs end-to-end with Person A and Person B
- [ ] Set up Secret Manager for DB password and GCS credentials

### Day 7–8 · CI/CD & Final Infrastructure
- [ ] Write `cloudbuild.yaml` — triggers on push to `main`:
  ```yaml
  steps:
    - Build backend image
    - Build frontend image
    - Push to Artifact Registry
    - Deploy backend to Cloud Run
    - Deploy frontend to Cloud Run
  ```
- [ ] Set up Cloud Build trigger on GitHub repo `main` branch
- [ ] Test full CI/CD pipeline with a dummy commit
- [ ] Upload final `model_v1_final.pkl` from Person C to `petricommend-model-store`
- [ ] Upload `breeds.json`, `foods.json` from Person C to `petricommend-data`
- [ ] Run full end-to-end smoke test on live URLs

### Day 9–10 · Report & Slides
- [ ] Compile full **project report** from all members' sections:
  - Introduction & Problem Statement (Person D writes)
  - System Architecture diagram (Person D writes)
  - Frontend section (from Person A)
  - Backend/API section (from Person B)
  - ML & Algorithm section (from Person C)
  - Deployment & Infrastructure section (Person D writes)
  - Results & Evaluation (from Person C metrics)
  - Conclusion & Future Work (Person D writes)
- [ ] Compile **presentation slides** from all members' contributions:
  - Slide 1–2: Problem & Overview (Person D)
  - Slide 3–5: ML Algorithm Comparison + Results (Person C)
  - Slide 6–7: System Architecture + GCP Deployment (Person D)
  - Slide 8–9: API Design (Person B)
  - Slide 10–12: UI Demo Walkthrough (Person A)
  - Slide 13: MLflow Dashboard Screenshot (Person C)
  - Slide 14: Conclusion (all)
- [ ] Finalise `README.md` with setup guide, architecture overview, and live demo URLs

### Day 11 · Final Polish
- [ ] Final test of live demo — all 3 features working on GCP
- [ ] Rehearse presentation with all 4 members
- [ ] Final GitHub push, tag `v1.0.0`
- [ ] Submit

### Person D Deliverables
- ✅ `docker-compose.yml` for local dev
- ✅ `Dockerfile` for backend
- ✅ `cloudbuild.yaml` — CI/CD pipeline
- ✅ MLflow server live on GCP (GCE VM)
- ✅ Frontend + Backend live on Cloud Run
- ✅ Cloud Storage buckets configured
- ✅ Final `README.md`
- ✅ Full project report (compiled from all sections)
- ✅ Presentation slides (compiled from all members)

---

## 🔗 Dependency Map

Understanding who depends on who prevents blockers.

```
Person C (Data)
    │
    ├─► breeds.json + foods.json ──────────────► Person B (needs to load data files)
    │                                                     │
    ├─► schemas agreed ────────────────────────────────►  Person A (TypeScript types)
    │
    ├─► model.py interface ────────────────────► Person B (calls model.recommend())
    │
    └─► model.pkl + MLflow URL ────────────────► Person D (uploads to GCS, configures server)

Person B (Backend)
    │
    └─► Live API URL ──────────────────────────► Person A (set NEXT_PUBLIC_API_URL)

Person A + B (Frontend + Backend)
    │
    └─► Dockerfiles ───────────────────────────► Person D (builds + deploys images)

Person D (DevOps)
    │
    └─► Live GCP URLs ─────────────────────────► Person A (final integration test)
```

### Critical Handoff Deadlines

| What | From | To | Deadline |
|---|---|---|---|
| `breeds.json` + `foods.json` schemas | Person C | Persons A & B | **End of Day 2** |
| `Dockerfile` (frontend) | Person A | Person D | **End of Day 2** |
| MLflow server URL | Person D | Person C | **End of Day 4** |
| `model.py` interface (function signatures) | Person C | Person B | **End of Day 6** |
| Backend live GCP URL | Person D | Person A | **End of Day 6** |
| `model_v1_final.pkl` | Person C | Person D (upload to GCS) | **End of Day 8** |
| All report sections | Persons A, B, C | Person D | **End of Day 10** |
| All slide content | Persons A, B, C | Person D | **End of Day 10** |

---

## 📝 Shared Responsibilities (All 4 Members)

These tasks are NOT owned by one person — everyone contributes.

| Task | Who Does What |
|---|---|
| **GitHub repo setup** | Person D creates repo; all members create their own branch and open PRs |
| **Code reviews** | Each PR requires 1 reviewer from another member before merge |
| **Sync meetings** | All 4 attend 3 sync checkpoints (Day 3, Day 7, Day 10) |
| **Report writing** | Each person writes their own layer's section (see Person D for compilation) |
| **Presentation** | Each person presents their own section during demo day |
| **README.md** | Each person fills in the section for their layer |

---

## 📁 GitHub Branch Strategy

```
main                  ← Production branch (Person D manages)
├── feat/frontend     ← Person A works here
├── feat/backend      ← Person B works here
├── feat/ml           ← Person C works here
└── feat/devops       ← Person D works here
```

- All work happens on feature branches
- Merge to `main` only after passing local tests + 1 code review
- Tag `v1.0.0` on Day 11 before submission

---

## ✅ Final Submission Checklist

| Item | Owner | Status |
|---|---|---|
| GitHub repo (public, tagged `v1.0.0`) | Person D | ☐ |
| Frontend live on Cloud Run | Person D | ☐ |
| Backend live on Cloud Run | Person D | ☐ |
| MLflow dashboard accessible | Person D | ☐ |
| 4 MLflow experiment runs logged | Person C | ☐ |
| Best model in MLflow Model Registry | Person C | ☐ |
| `POST /recommend` returns correct results | Person B | ☐ |
| `POST /compare` returns comparison data | Person B | ☐ |
| All 3 frontend features working (Profile, Recs, Compare) | Person A | ☐ |
| Project report (PDF or MD) | Person D | ☐ |
| Presentation slides | Person D | ☐ |
| `README.md` with setup + live URLs | Person D | ☐ |

---

*Group Plan v1.0 — Pet Lifestyle & Nutrition Recommender · Final Subject Project*
