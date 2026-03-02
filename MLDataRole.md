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