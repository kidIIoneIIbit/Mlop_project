"""
Model Loader — Download & Cache Model from GCS
================================================
Person C — ML / Data  |  Day 7 Deliverable

Provides a singleton pattern for loading the recommendation model.
On startup, downloads model.pkl from Google Cloud Storage (if configured),
otherwise loads from local path.

Usage (in FastAPI app):
    from backend.ml.load_model import get_model
    model = get_model()
    results = model.recommend(pet_profile, top_k=6)
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

# Add project paths for imports
BACKEND_ML_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BACKEND_ML_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent
ML_DIR = PROJECT_DIR / "ml"

for p in [str(BACKEND_ML_DIR), str(ML_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from model import RecommendationModel

# ── Configuration (from environment variables) ───────────────────────────
GCS_BUCKET = os.environ.get("MODEL_GCS_BUCKET", "petricommend-model-store")
GCS_BLOB = os.environ.get("MODEL_GCS_BLOB", "models/model.pkl")
LOCAL_MODEL_PATH = os.environ.get(
    "MODEL_LOCAL_PATH",
    str(BACKEND_ML_DIR / "model.pkl"),
)
USE_GCS = os.environ.get("MODEL_USE_GCS", "false").lower() == "true"

# ── Singleton ────────────────────────────────────────────────────────────
_model_instance: Optional[RecommendationModel] = None


def download_model_from_gcs(
    bucket_name: str = GCS_BUCKET,
    blob_path: str = GCS_BLOB,
    local_path: str = LOCAL_MODEL_PATH,
) -> Path:
    """
    Download model.pkl from Google Cloud Storage.

    Returns the local path where the model was saved.
    """
    try:
        from google.cloud import storage

        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_path)

        local = Path(local_path)
        local.parent.mkdir(parents=True, exist_ok=True)

        blob.download_to_filename(str(local))
        print(f"✅ Model downloaded from gs://{bucket_name}/{blob_path} → {local}")
        return local

    except ImportError:
        raise RuntimeError(
            "google-cloud-storage not installed. "
            "Run: pip install google-cloud-storage"
        )
    except Exception as e:
        raise RuntimeError(f"Failed to download model from GCS: {e}")


def get_model(force_reload: bool = False) -> RecommendationModel:
    """
    Get the singleton RecommendationModel instance.

    On first call:
        1. If USE_GCS=true, downloads model.pkl from GCS
        2. Loads model from LOCAL_MODEL_PATH
        3. If no .pkl file exists, falls back to CBF-only mode using JSON data

    Args:
        force_reload: If True, reload even if already loaded.

    Returns:
        Loaded RecommendationModel instance.
    """
    global _model_instance

    if _model_instance is not None and not force_reload:
        return _model_instance

    model = RecommendationModel()

    # Strategy 1: Download from GCS
    if USE_GCS:
        try:
            local_path = download_model_from_gcs()
            model.load(local_path)
            _model_instance = model
            return model
        except Exception as e:
            print(f"⚠ GCS download failed: {e}")
            print("  Falling back to local model …")

    # Strategy 2: Load local .pkl file
    local = Path(LOCAL_MODEL_PATH)
    if local.exists():
        model.load(local)
        _model_instance = model
        return model

    # Strategy 3: CBF fallback using JSON data
    print("⚠ No model.pkl found — initializing CBF-only mode from JSON data")
    import json

    data_dir = BACKEND_DIR / "data"
    breeds_path = data_dir / "breeds.json"
    foods_path = data_dir / "foods.json"

    if breeds_path.exists() and foods_path.exists():
        with open(breeds_path) as f:
            breeds = json.load(f)
        with open(foods_path) as f:
            foods = json.load(f)
        model.load_from_data(foods, breeds)
    else:
        raise FileNotFoundError(
            f"No model.pkl and no data files found. "
            f"Expected data at {data_dir} or model at {local}"
        )

    _model_instance = model
    return model


def reset_model() -> None:
    """Reset the singleton (useful for testing)."""
    global _model_instance
    _model_instance = None


# ════════════════════════════════════════════════════════════════════════════
#  MAIN (self-test)
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🧪 Testing model loader …\n")

    # Force CBF mode for local testing
    model = get_model()
    info = model.get_model_info()
    print(f"Model info: {info}")

    # Quick recommendation test
    profile = {
        "species": "dog",
        "size": "large",
        "age_years": 5,
        "activity_level": "high",
        "health_conditions": ["joint"],
        "breed_id": "dog-breed-001",
    }
    results = model.recommend(profile, top_k=3)
    print(f"\nTop 3 for Labrador:")
    for r in results:
        print(f"  {r.score:5.1f}  {r.name}")

    print("\n✅ Model loader test passed.")
