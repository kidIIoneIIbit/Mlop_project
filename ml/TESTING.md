# ML Feature Files — Testing Guide

> **Person C — ML / Data Role**
> Last updated: 2026-03-02

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [File Overview](#2-file-overview)
3. [Test: mock_generator.py](#3-test-mock_generatorpy)
4. [Test: features.py](#4-test-featurespy)
5. [Test: trainer.py](#5-test-trainerpy)
6. [Test: evaluator.py](#6-test-evaluatorpy)
7. [Test: report_generator.py](#7-test-report_generatorpy)
8. [Test: backend/ml/model.py](#8-test-backendmlmodelpy)
9. [Test: backend/ml/load_model.py](#9-test-backendmlload_modelpy)
10. [Full Pipeline Test](#10-full-pipeline-test)
11. [Expected Outputs](#11-expected-outputs)
12. [Known Limitations](#12-known-limitations)

---

## 1. Environment Setup

### Prerequisites

| Requirement       | Version             | Notes                                          |
|-------------------|---------------------|-------------------------------------------------|
| Python            | **3.11.x**          | 3.14 not compatible with LightFM compilation   |
| pip               | ≥ 24.0              | Bundled with Python 3.11 venv                   |
| LightFM           | 1.17 *(optional)*   | Requires C compiler; skipped on Windows locally |

### Create virtual environment

```powershell
# Windows
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS
python3.11 -m venv .venv
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r ml/requirements.txt
```

> **Note:** On Windows without MSVC Build Tools, LightFM will fail to install.
> All modules gracefully fall back to CBF-only mode when LightFM is unavailable.

### Verify installation

```bash
python -c "import mlflow, faker, pandas, scipy, sklearn, matplotlib, numpy; print('All imports OK')"
```

---

## 2. File Overview

| File                        | Purpose                                           | LightFM Required? |
|-----------------------------|---------------------------------------------------|--------------------|
| `ml/mock_generator.py`     | Generate deterministic mock data (SEED=42)        | No                 |
| `ml/features.py`           | Feature encoding + CBF baseline scorer            | Optional           |
| `ml/trainer.py`            | Run experiments 1–4, log to MLflow                | Exp 2–4 only       |
| `ml/evaluator.py`          | Standalone recommendation metrics                 | Optional (AUC)     |
| `ml/report_generator.py`   | Generate HTML evaluation report                   | No                 |
| `backend/ml/model.py`      | `RecommendationModel` serving interface           | Optional           |
| `backend/ml/load_model.py` | Singleton model loader (GCS + local + CBF)        | No                 |

---

## 3. Test: mock_generator.py

### Run

```bash
cd d:\mlops_2_2025\final_project
python ml/mock_generator.py
```

### Expected output

```
🔄 Generating mock data (SEED=42) …
🔍 Validating data …
✅ Validation passed:
   Breeds: 21  (11 dog + 10 cat)
   Foods:  24  (12 dog + 12 cat)
   Users:  200
   Interactions: 1666
📁 Written: ...\backend\data\breeds.json
📁 Written: ...\backend\data\foods.json
📁 Written: ...\backend\data\interactions.json
✅ Mock data generation complete.
```

### What to verify

| Check                              | Expected                               |
|------------------------------------|----------------------------------------|
| `breeds.json` exists               | 21 entries (11 dog + 10 cat)           |
| `foods.json` exists                | 24 entries (12 dog + 12 cat)           |
| `interactions.json` exists         | 1,666 interactions from 200 users      |
| Determinism (re-run produces same) | Identical JSON output each time        |
| Breed ID format                    | `dog-breed-001` … `cat-breed-010`      |
| Food ID format                     | `dog-food-001` … `cat-food-012`        |
| Rating range                       | All ratings are 1–5 (integer)          |
| Timestamps                         | ISO format, within 2025                |
| `nutritional_targets`              | Every breed has protein_min, fat_min, fiber_min, calorie_range |
| Species consistency                | Dog foods rated only by dog-preference users, same for cats    |

### Validation assertions (built-in)

The `validate_data()` function checks:
- Correct breed/food counts per species
- All required fields present
- Nutritional values in realistic ranges (`protein_min` 18–45, `fat_min` 5–25, etc.)
- Price > 0, rating between 1.0–5.0
- All interaction item_ids reference valid food IDs
- Exactly 200 unique users

### CLI option

```bash
python ml/mock_generator.py --output-dir ./custom_dir
```

---

## 4. Test: features.py

### Run

```bash
python ml/features.py
```

### Expected output

```
Pet features: ['species:dog', 'size:large', 'age_group:adult', 'activity:high', 'health:joint', 'health:skin']
Food features (Premium Chicken & Rice Formula): ['species:dog', 'food_type:dry', 'protein_med', 'fat_med', 'tag:joint-support', 'tag:veterinary']

Top 6 foods for Labrador (active, joint+skin issues):
  Hip & Joint Support Duck Formula                 score=86.7
  Grain-Free Salmon & Sweet Potato                 score=86.5
  Premium Chicken & Rice Formula                   score=83.3
  ...

⚠ LightFM not available — skipping dataset build test.
  CBF baseline scoring works. LightFM pipeline will work on Linux/GCP.
```

### Functions to test

#### `encode_pet_features()`

```python
from features import encode_pet_features

pet = {
    "species": "dog",
    "size": "large",
    "age_years": 5,
    "activity_level": "high",
    "health_conditions": ["joint", "skin"],
}
result = encode_pet_features(pet)
# Expected: ['species:dog', 'size:large', 'age_group:adult', 'activity:high', 'health:joint', 'health:skin']
assert "species:dog" in result
assert "age_group:adult" in result
assert "health:joint" in result
```

#### `encode_food_features()`

```python
from features import encode_food_features

food = {
    "species": "dog",
    "food_type": "dry",
    "nutritional_content": {"protein": 28, "fat": 12, "fiber": 4, "kcal_per_100g": 360},
    "tags": ["joint-support", "veterinary"],
}
result = encode_food_features(food)
# Expected: ['species:dog', 'food_type:dry', 'protein_med', 'fat_med', 'tag:joint-support', 'tag:veterinary']
assert "food_type:dry" in result
assert "protein_med" in result
```

#### `_bin_age()` — age group mapping

| Species | Age (years) | Expected group |
|---------|-------------|----------------|
| dog     | 0.5         | puppy          |
| dog     | 1.4         | puppy          |
| dog     | 1.5         | adult          |
| dog     | 7.9         | adult          |
| dog     | 8.0         | senior         |
| cat     | 0.5         | puppy          |
| cat     | 1.0         | adult          |
| cat     | 9.9         | adult          |
| cat     | 10.0        | senior         |

#### `cbf_score()` — content-based scoring

```python
from features import cbf_score

pet = {"species": "dog", "age_years": 5, "health_conditions": ["joint"]}
food = {
    "species": "dog",
    "food_type": "dry",
    "nutritional_content": {"protein": 28, "fat": 12, "fiber": 4, "kcal_per_100g": 360},
    "tags": ["joint-support", "glucosamine"],
}
targets = {"protein_min": 22, "fat_min": 8, "fiber_min": 3, "calorie_range": [1500, 2000]}
score = cbf_score(pet, food, targets)

# Score should be > 0 (species match)
assert 0 < score <= 100

# Species mismatch → 0
food_cat = {**food, "species": "cat"}
assert cbf_score(pet, food_cat, targets) == 0.0
```

**CBF score components (100 total):**

| Component       | Weight | Logic                                               |
|-----------------|--------|-----------------------------------------------------|
| Species match   | gate   | Returns 0.0 if mismatch                             |
| Protein         | 25 pts | Full if `protein ≥ protein_min`, else proportional   |
| Fat             | 25 pts | Full if `fat ≥ fat_min`, else proportional           |
| Fiber           | 15 pts | Full if `fiber ≥ fiber_min`, else proportional       |
| Calorie fit     | 20 pts | Full if daily estimate within `calorie_range`        |
| Tag bonus       | 15 pts | Overlap between health-condition tags and food tags  |

#### `score_all_foods()` — top-k recommendations

```python
from features import score_all_foods, load_all_data

breeds, foods, _ = load_all_data()
pet = {
    "species": "cat",
    "breed_id": "cat-breed-001",
    "age_years": 12,
    "health_conditions": ["kidney"],
}
top = score_all_foods(pet, foods, breeds, top_k=3)

assert len(top) <= 3
assert all(t["food"]["species"] == "cat" for t in top)
assert top[0]["score"] >= top[1]["score"]  # sorted descending
```

#### `build_lightfm_dataset()` — (LightFM required)

```python
# Only runs when LightFM is installed
from features import LIGHTFM_AVAILABLE, build_lightfm_dataset, build_interaction_matrix, build_item_features, load_all_data

if LIGHTFM_AVAILABLE:
    _, foods, interactions = load_all_data()
    dataset, mappings = build_lightfm_dataset(foods, interactions)
    train, test = build_interaction_matrix(dataset, interactions)
    item_feats = build_item_features(dataset, foods)

    assert train.shape[0] == 200   # users
    assert train.shape[1] == 24    # items
    assert train.nnz + test.nnz > 0
    print(f"Train: {train.nnz}, Test: {test.nnz}, Item features: {item_feats.shape}")
```

---

## 5. Test: trainer.py

### Run

```bash
python ml/trainer.py
```

### Expected output (without LightFM)

```
📂 Loading data …

🔬 Experiment 1: CBF Baseline
  ✅ Logged run 'exp1_cbf_baseline' → <run_id>
  Precision@5=0.1650  NDCG@5=0.2731

⚠ LightFM not available — skipping experiments 2–4.
  Install LightFM on Linux/GCP to run full pipeline.

📊 Results saved: ...\reports\experiment_results.json

🎉 All experiments complete!
```

### Expected output (with LightFM on Linux/GCP)

```
📂 Loading data …

🔬 Experiment 1: CBF Baseline
  ✅ Logged run → <run_id>

🔬 Experiment 2: LightFM WARP (32d, 30ep)
  ✅ Logged run → <run_id>

🔬 Experiment 3: LightFM WARP (64d, 50ep)
  ✅ Logged run → <run_id>

🔬 Experiment 4: LightFM BPR (32d, 30ep)
  ✅ Logged run → <run_id>

📊 Results saved: ...\reports\experiment_results.json

🏆 Training final model (best experiment) …
✅ Final model saved.

🎉 All experiments complete!
```

### What to verify

| Check                                | Expected                                       |
|--------------------------------------|-------------------------------------------------|
| `reports/experiment_results.json`    | Created with metrics for each completed experiment |
| MLflow runs in `ml/mlruns/`          | One run per experiment                          |
| CBF Precision@5                      | ~0.1650 (deterministic with SEED=42)            |
| CBF NDCG@5                           | ~0.2731                                         |
| LightFM experiments skip gracefully  | Warning printed, no crash                       |

### MLflow tracking URI

```bash
# View experiments in MLflow UI
cd ml
mlflow ui --port 5001
# Open: http://localhost:5001
```

---

## 6. Test: evaluator.py

### Run

```bash
python ml/evaluator.py
```

### Expected output

```
🧪 Evaluator self-test

Recommended: ['item_a', 'item_b', 'item_c', 'item_d', 'item_e']
Relevant:    {'item_f', 'item_b', 'item_d'}
  Precision@5 = 0.4000  (expect 0.4000)
  Recall@5    = 0.6667  (expect 0.6667)
  NDCG@5      = 0.4982  (expect ~0.6934)
  MRR         = 0.5000  (expect 0.5000)
  Hit@5       = 1.0000  (expect 1.0000)

📊 Batch evaluation test:
  precision_at_k: 0.4
  recall_at_k: 1.0
  ndcg_at_k: 0.7853...
  mrr: 0.75
  hit_rate_at_k: 1.0
  num_users_evaluated: 2

✅ All evaluator tests passed.
```

### Individual metric tests

```python
from evaluator import precision_at_k, recall_at_k, ndcg_at_k, mean_reciprocal_rank, hit_rate_at_k

recs = ["a", "b", "c", "d", "e"]
rels = {"b", "d", "f"}

assert precision_at_k(recs, rels, 5)        == 0.4
assert abs(recall_at_k(recs, rels, 5) - 2/3) < 1e-6
assert mean_reciprocal_rank(recs, rels)      == 0.5   # "b" is at position 2
assert hit_rate_at_k(recs, rels, 5)          == 1.0

# Edge cases
assert precision_at_k([], rels, 5)           == 0.0
assert recall_at_k(recs, set(), 5)           == 0.0
assert mean_reciprocal_rank(["x", "y"], rels) == 0.0   # no relevant in recs
```

### Batch evaluation

```python
from evaluator import evaluate_recommendations

user_recs = {"u1": ["a", "b"], "u2": ["x", "y"]}
user_rels = {"u1": {"b"}, "u2": {"z"}}

metrics = evaluate_recommendations(user_recs, user_rels, k=5)
assert metrics["num_users_evaluated"] == 2
assert metrics["precision_at_k"] >= 0
```

---

## 7. Test: report_generator.py

### Run

```bash
python ml/report_generator.py
```

### Expected output

```
📄 Report generated: ...\reports\evaluation_report.html
```

### What to verify

| Check                             | Expected                                       |
|-----------------------------------|-------------------------------------------------|
| `reports/evaluation_report.html`  | File created, opens in browser                  |
| Comparison table                  | Shows metrics for each experiment               |
| Bar charts                        | Embedded as base64 PNGs (no external files)     |
| Training time chart               | Shows per-experiment timing                     |

### CLI option

```bash
python ml/report_generator.py --results-path ./reports/experiment_results.json
```

---

## 8. Test: backend/ml/model.py

### Run

```bash
python backend/ml/model.py
```

### Expected output

```
✅ Model initialized in CBF-only mode
🧪 Integration Test — RecommendationModel (CBF mode)

📋 Labrador (active, joint+skin)
    86.7  Hip & Joint Support Duck Formula               Meets protein needs ...
    86.5  Grain-Free Salmon & Sweet Potato               ...
    ...

📋 Persian (senior, kidney)
    90.0  Senior Cat Gentle Care                         ...
    ...

📋 Beagle (puppy, no issues)
    ...

📋 Siamese (adult, digestive)
    ...

📋 Bulldog (senior, joint+weight)
    92.5  Hip & Joint Support Duck Formula               ...
    ...

ℹ Model info: {
  "status": "loaded",
  "mode": "cbf",
  ...
}

✅ All integration tests passed.
```

### What to verify

| Check                              | Expected                                       |
|------------------------------------|-------------------------------------------------|
| 5 pet profiles tested              | Labrador, Persian, Beagle, Siamese, Bulldog    |
| Species filtering                  | Dog profiles → only dog foods; cat → only cat  |
| Scores sorted descending           | First food has highest score                    |
| Match reasons present              | 1–3 human-readable reasons per food             |
| `ScoredFood.to_dict()` works       | Returns plain dict (JSON-serializable)          |
| `get_model_info()` returns dict    | Keys: status, mode, version, total_foods, etc. |

### Unit test snippets

```python
import sys
sys.path.insert(0, "backend/ml")
sys.path.insert(0, "ml")

from model import RecommendationModel

model = RecommendationModel()
model.load_from_data()  # CBF-only

pet = {
    "species": "dog",
    "size": "large",
    "age_years": 5,
    "activity_level": "high",
    "health_conditions": ["joint"],
    "breed_id": "dog-breed-001",
}

results = model.recommend(pet, top_k=3)
assert len(results) == 3
assert all(r.species == "dog" for r in results)
assert results[0].score >= results[1].score
assert results[0].match_reasons  # non-empty list

info = model.get_model_info()
assert info["status"] == "loaded"
assert info["mode"] == "cbf"
```

---

## 9. Test: backend/ml/load_model.py

### Run

```bash
python backend/ml/load_model.py
```

### Expected output

```
🧪 Testing model loader …

⚠ No model.pkl found — initializing CBF-only mode from JSON data
✅ Model initialized in CBF-only mode
Model info: {'status': 'loaded', 'mode': 'cbf', ...}

Top 3 for Labrador:
   94.2  Hip & Joint Support Duck Formula
   87.1  Premium Chicken & Rice Formula
   85.3  Senior Vitality Lamb & Oats

✅ Model loader test passed.
```

### What to verify

| Check                              | Expected                                    |
|------------------------------------|---------------------------------------------|
| Singleton pattern                  | `get_model()` returns same instance twice   |
| CBF fallback                       | Works when no `model.pkl` exists            |
| `reset_model()` clears singleton   | Next `get_model()` re-initializes           |

### Environment variables

| Variable            | Default                      | Description                        |
|---------------------|------------------------------|------------------------------------|
| `MODEL_GCS_BUCKET`  | `petricommend-model-store`   | GCS bucket name                    |
| `MODEL_GCS_BLOB`    | `models/model.pkl`           | Blob path in bucket                |
| `MODEL_LOCAL_PATH`  | `backend/ml/model.pkl`       | Local pickle path                  |
| `MODEL_USE_GCS`     | `false`                      | Set to `true` to download from GCS |

---

## 10. Full Pipeline Test

Run the entire ML pipeline end-to-end:

```bash
cd d:\mlops_2_2025\final_project

# Step 1: Generate mock data
python ml/mock_generator.py

# Step 2: Run experiments (CBF locally, all 4 on Linux/GCP)
python ml/trainer.py

# Step 3: Generate report
python ml/report_generator.py

# Step 4: Test model serving
python backend/ml/model.py

# Step 5: Test model loader
python backend/ml/load_model.py

# Step 6: View MLflow UI (optional)
cd ml && mlflow ui --port 5001
```

### Pipeline success criteria

- [ ] All 3 JSON data files generated in `backend/data/`
- [ ] CBF experiment logged to MLflow (Precision@5 ≈ 0.1650, NDCG@5 ≈ 0.2731)
- [ ] `reports/experiment_results.json` created
- [ ] `reports/evaluation_report.html` created and renders in browser
- [ ] Model serves 6 recommendations per pet profile
- [ ] All scores between 0–100, sorted descending
- [ ] Match reasons are human-readable strings

---

## 11. Expected Outputs

### Output files after full pipeline

```
backend/data/
├── breeds.json           # 21 breeds (11 dog + 10 cat)
├── foods.json            # 24 foods  (12 dog + 12 cat)
└── interactions.json     # 1,666 interactions (200 users)

ml/mlruns/                # MLflow local tracking (gitignored)
└── <experiment_id>/
    └── <run_id>/

reports/
├── experiment_results.json   # Raw metrics per experiment
└── evaluation_report.html    # Visual HTML report with charts
```

### Deterministic outputs (SEED=42)

| Metric                        | Value    |
|-------------------------------|----------|
| Total breeds                  | 21       |
| Total foods                   | 24       |
| Total interactions            | 1,666    |
| Unique users                  | 200      |
| CBF Precision@5               | 0.1650   |
| CBF NDCG@5                    | 0.2731   |

---

## 12. Known Limitations

| Issue                              | Impact                                         | Workaround                                 |
|------------------------------------|-------------------------------------------------|--------------------------------------------|
| **LightFM won't install on Windows** | Experiments 2–4 skipped locally                | Run in Docker / GCP (Linux-based)          |
| **No C compiler (MSVC)**           | LightFM compilation fails                      | Install VS Build Tools or use Linux        |
| **Mock data only**                 | Metrics reflect synthetic distribution          | Expected — real data comes from Person A   |
| **CBF baseline is simple**         | Precision@5 ≈ 0.165 (low)                      | LightFM experiments expected to improve    |
| **MLflow local only**              | `ml/mlruns/` is gitignored                     | GCP MLflow tracking server (Person D)      |
| **Calorie estimation is rough**    | Wet food: kcal×8, dry: kcal×3                  | Acceptable for mock data ranking           |
