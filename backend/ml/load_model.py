from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

# Add ml/ directory to path so imports work
BACKEND_ML_DIR = Path(__file__).resolve().parent
BACKEND_DIR    = BACKEND_ML_DIR.parent

for p in [str(BACKEND_ML_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from model import RecommendationModel

# ── Configuration ─────────────────────────────────────────────────────────
GCS_BUCKET       = os.environ.get("MODEL_GCS_BUCKET", "petricommend-model-store")
GCS_BLOB         = os.environ.get("MODEL_GCS_BLOB", "models/model.pkl")
LOCAL_MODEL_PATH = os.environ.get("MODEL_LOCAL_PATH", str(BACKEND_ML_DIR / "model.pkl"))
USE_GCS          = os.environ.get("MODEL_USE_GCS", "false").lower() == "true"

# ── Singleton ─────────────────────────────────────────────────────────────
_model_instance: Optional[RecommendationModel] = None


def download_model_from_gcs(
    bucket_name: str = GCS_BUCKET,
    blob_path: str = GCS_BLOB,
    local_path: str = LOCAL_MODEL_PATH,
) -> Path:
    try:
        from google.cloud import storage
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob   = bucket.blob(blob_path)
        local  = Path(local_path)
        local.parent.mkdir(parents=True, exist_ok=True)
        blob.download_to_filename(str(local))
        print(f"[OK] Model downloaded from gs://{bucket_name}/{blob_path} -> {local}")
        return local
    except ImportError:
        raise RuntimeError("google-cloud-storage not installed. Run: pip install google-cloud-storage")
    except Exception as e:
        raise RuntimeError(f"Failed to download model from GCS: {e}")


def get_model(force_reload: bool = False) -> RecommendationModel:
    """
    Get the singleton RecommendationModel instance.

    Priority:
      1. Download from GCS (if MODEL_USE_GCS=true)
      2. Load local model.pkl
      3. CBF-only fallback from breeds.json + foods.json
    """
    global _model_instance

    if _model_instance is not None and not force_reload:
        return _model_instance

    model = RecommendationModel()

    # Strategy 1: GCS
    if USE_GCS:
        try:
            local_path = download_model_from_gcs()
            model.load(local_path)
            _model_instance = model
            return model
        except Exception as e:
            print(f"[WARN] GCS download failed: {e} - falling back to local ...")

    # Strategy 2: Local .pkl
    local = Path(LOCAL_MODEL_PATH)
    if local.exists():
        model.load(local)
        _model_instance = model
        return model

    # Strategy 3: CBF fallback from JSON data
    print("[INFO] No model.pkl found - initializing CBF-only mode from JSON data")
    import json

    data_dir    = BACKEND_DIR / "data"
    breeds_path = data_dir / "breeds.json"
    foods_path  = data_dir / "foods.json"

    if breeds_path.exists() and foods_path.exists():
        with open(breeds_path) as f:
            breeds = json.load(f)
        with open(foods_path) as f:
            foods = json.load(f)
        model.load_from_data(foods, breeds)
    else:
        raise FileNotFoundError(
            f"No model.pkl and no data files found. Expected data at {data_dir}"
        )

    _model_instance = model
    return model


def reset_model() -> None:
    """Reset the singleton (useful for testing)."""
    global _model_instance
    _model_instance = None
