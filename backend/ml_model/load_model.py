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
GCS_BUCKET = os.environ.get("MODEL_GCS_BUCKET", "petrecommend-model-store")
GCS_BLOB = os.environ.get("MODEL_GCS_BLOB", "models/model.pkl")
GCS_PREFIX = os.environ.get("MODEL_GCS_PREFIX", "models/")
LOCAL_MODEL_PATH = os.environ.get(
    "MODEL_LOCAL_PATH",
    str(BACKEND_ML_DIR / "model.pkl"),
)
USE_GCS = os.environ.get("MODEL_USE_GCS", "false").lower() == "true"
# When true, auto-discover the latest .pkl in the GCS prefix instead of using a fixed blob path
AUTO_LATEST = os.environ.get("MODEL_GCS_LATEST", "true").lower() == "true"

# ── Singleton ────────────────────────────────────────────────────────────
_model_instance: Optional[RecommendationModel] = None


def find_latest_model_in_gcs(
    bucket_name: str = GCS_BUCKET,
    prefix: str = GCS_PREFIX,
) -> Optional[str]:
    """
    List all .pkl blobs under `prefix` in the bucket and return the blob
    path of the most recently uploaded one.

    Returns None if no .pkl files are found.
    """
    try:
        from google.cloud import storage

        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blobs = list(bucket.list_blobs(prefix=prefix))

        # Filter to .pkl files only
        pkl_blobs = [b for b in blobs if b.name.endswith(".pkl")]

        if not pkl_blobs:
            print(f"  ⚠ No .pkl files found in gs://{bucket_name}/{prefix}")
            return None

        # Sort by updated time (most recent last) and pick the latest
        pkl_blobs.sort(key=lambda b: b.updated)
        latest = pkl_blobs[-1]

        print(f"  📦 Found {len(pkl_blobs)} model(s) in GCS:")
        for b in pkl_blobs:
            marker = " ← latest" if b.name == latest.name else ""
            size_kb = (b.size or 0) / 1024
            print(f"     • gs://{bucket_name}/{b.name}  ({size_kb:.0f} KB, {b.updated.strftime('%Y-%m-%d %H:%M:%S')}){marker}")

        return latest.name

    except ImportError:
        print("  ⚠ google-cloud-storage not installed — cannot list GCS models")
        return None
    except Exception as e:
        print(f"  ⚠ Failed to list GCS models: {e}")
        return None


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
        1. If USE_GCS=true and MODEL_GCS_LATEST=true (default),
           auto-discovers the latest .pkl model in the GCS bucket prefix,
           downloads it, and loads it.
           If MODEL_GCS_LATEST=false, downloads the fixed MODEL_GCS_BLOB path.
        2. Loads model from LOCAL_MODEL_PATH if it exists
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
            blob_path = GCS_BLOB  # default fixed path

            # Auto-discover the latest model if enabled
            if AUTO_LATEST:
                print("🔍 Auto-discovering latest model in GCS …")
                latest_blob = find_latest_model_in_gcs()
                if latest_blob:
                    blob_path = latest_blob
                    print(f"  ✅ Using latest model: {blob_path}")
                else:
                    print(f"  ℹ Falling back to default: {GCS_BLOB}")

            local_path = download_model_from_gcs(blob_path=blob_path)
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
