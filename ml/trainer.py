"""
Trainer — LightFM Training & MLflow Experiment Tracking
=======================================================
Person C — ML / Data  |  Day 3–6 Deliverable

Runs 4 experiments:
  1. CBF Baseline  (content-based scoring)
  2. LightFM WARP  (num_components=32, epochs=30)
  3. LightFM WARP  (num_components=64, epochs=50)
  4. LightFM BPR   (num_components=32, epochs=30)

All experiments are logged to MLflow.

Usage:
    python trainer.py [--tracking-uri http://localhost:5000]
"""

from __future__ import annotations

import argparse
import json
import os
import pickle
import random
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import mlflow
import numpy as np

# Local modules
from features import (
    LIGHTFM_AVAILABLE,
    build_interaction_matrix,
    build_item_features,
    build_lightfm_dataset,
    cbf_score,
    load_all_data,
    score_all_foods,
)

# Lazy import LightFM
if LIGHTFM_AVAILABLE:
    from lightfm import LightFM
    from lightfm.evaluation import auc_score as lfm_auc_score
    from lightfm.evaluation import precision_at_k as lfm_precision_at_k

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

EXPERIMENT_NAME = "pet-nutrition-recommender"
MODEL_DIR = Path(__file__).resolve().parent.parent / "backend" / "ml_model"
DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"


# ════════════════════════════════════════════════════════════════════════════
#  EVALUATION HELPERS
# ════════════════════════════════════════════════════════════════════════════


def ndcg_at_k(recommended: list, relevant: set, k: int) -> float:
    """
    Compute Normalized Discounted Cumulative Gain @ k.

    Args:
        recommended: ordered list of item IDs (best first)
        relevant:    set of ground-truth relevant item IDs
        k:           cutoff
    """
    dcg = 0.0
    for i, item in enumerate(recommended[:k]):
        if item in relevant:
            dcg += 1.0 / np.log2(i + 2)  # i is 0-indexed → +2

    # Ideal DCG: all relevant items ranked first
    ideal_dcg = sum(1.0 / np.log2(i + 2) for i in range(min(k, len(relevant))))
    return dcg / ideal_dcg if ideal_dcg > 0 else 0.0


def precision_at_k(recommended: list, relevant: set, k: int) -> float:
    """Compute Precision @ k."""
    hits = sum(1 for item in recommended[:k] if item in relevant)
    return hits / k


# ════════════════════════════════════════════════════════════════════════════
#  EXPERIMENT 1 — CBF BASELINE
# ════════════════════════════════════════════════════════════════════════════


def run_cbf_experiment(
    breeds: list[dict],
    foods: list[dict],
    interactions: list[dict],
    k: int = 5,
) -> dict[str, float]:
    """
    Evaluate CBF baseline: score foods for each user-species and compute
    Precision@k and NDCG@k averaged across all test users.
    """
    # Build test set: last 20% of each user's interactions
    from collections import defaultdict

    user_interactions = defaultdict(list)
    for inter in interactions:
        user_interactions[inter["user_id"]].append(inter)

    precisions = []
    ndcgs = []

    for user_id, user_ints in user_interactions.items():
        if len(user_ints) < 3:
            continue

        # Sort by timestamp for temporal split
        user_ints.sort(key=lambda x: x["timestamp"])
        split = max(1, int(len(user_ints) * 0.8))
        test_items = {i["item_id"] for i in user_ints[split:]}

        if not test_items:
            continue

        # Determine user species from their interactions
        species = "dog" if user_ints[0]["item_id"].startswith("dog") else "cat"

        # Create mock pet profile
        pet_profile = {
            "species": species,
            "size": "medium",
            "age_years": 4,
            "activity_level": "medium",
            "health_conditions": [],
        }

        top_foods = score_all_foods(pet_profile, foods, breeds, top_k=k)
        recommended = [f["food_id"] for f in top_foods]

        precisions.append(precision_at_k(recommended, test_items, k))
        ndcgs.append(ndcg_at_k(recommended, test_items, k))

    metrics = {
        "precision_at_5": float(np.mean(precisions)) if precisions else 0.0,
        "ndcg_at_5": float(np.mean(ndcgs)) if ndcgs else 0.0,
    }

    return metrics


# ════════════════════════════════════════════════════════════════════════════
#  EXPERIMENTS 2–4 — LightFM
# ════════════════════════════════════════════════════════════════════════════


def train_lightfm_model(
    loss: str,
    num_components: int,
    epochs: int,
    train_matrix: Any,
    item_features: Any,
    learning_rate: float = 0.05,
) -> Any:
    """Train a LightFM model and return it."""
    if not LIGHTFM_AVAILABLE:
        raise RuntimeError("LightFM is not installed. Install it on Linux/GCP.")

    model = LightFM(
        loss=loss,
        no_components=num_components,
        learning_rate=learning_rate,
        random_state=SEED,
    )
    model.fit(
        train_matrix,
        item_features=item_features,
        epochs=epochs,
        num_threads=2,
        verbose=True,
    )
    return model


def evaluate_lightfm_model(
    model: Any,
    test_matrix: Any,
    train_matrix: Any,
    item_features: Any,
    k: int = 5,
) -> dict[str, float]:
    """Evaluate LightFM model using built-in metrics."""
    if not LIGHTFM_AVAILABLE:
        raise RuntimeError("LightFM is not installed.")

    prec = lfm_precision_at_k(
        model,
        test_matrix,
        train_interactions=train_matrix,
        item_features=item_features,
        k=k,
        num_threads=2,
    ).mean()

    auc = lfm_auc_score(
        model,
        test_matrix,
        train_interactions=train_matrix,
        item_features=item_features,
        num_threads=2,
    ).mean()

    # Compute NDCG@k manually from LightFM predictions
    n_users, n_items = test_matrix.shape
    ndcgs = []
    test_csr = test_matrix.tocsr()

    for user_id in range(n_users):
        test_items = set(test_csr[user_id].indices)
        if not test_items:
            continue

        scores = model.predict(
            user_id,
            np.arange(n_items),
            item_features=item_features,
        )
        top_k_items = np.argsort(-scores)[:k].tolist()
        ndcgs.append(ndcg_at_k(top_k_items, test_items, k))

    metrics = {
        "precision_at_5": float(prec),
        "ndcg_at_5": float(np.mean(ndcgs)) if ndcgs else 0.0,
        "auc_score": float(auc),
    }

    return metrics


# ════════════════════════════════════════════════════════════════════════════
#  MLflow RUN WRAPPER
# ════════════════════════════════════════════════════════════════════════════


def log_experiment(
    run_name: str,
    params: dict[str, Any],
    metrics: dict[str, float],
    model_obj: Any = None,
    artifacts: dict[str, str] | None = None,
) -> str:
    """Log an experiment to MLflow and return the run ID."""
    with mlflow.start_run(run_name=run_name) as run:
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)

        if artifacts:
            for name, path in artifacts.items():
                mlflow.log_artifact(path, artifact_path=name)

        if model_obj is not None:
            mlflow.pyfunc.log_model(
                artifact_path="model",
                python_model=mlflow.pyfunc.PythonModel(),
                artifacts=(
                    {"model_pickle": "model.pkl"}
                    if artifacts and "model.pkl" in str(artifacts)
                    else None
                ),
            )

        print(f"  ✅ Logged run '{run_name}' → {run.info.run_id}")
        return run.info.run_id


# ════════════════════════════════════════════════════════════════════════════
#  MAIN: RUN ALL EXPERIMENTS
# ════════════════════════════════════════════════════════════════════════════


def run_all_experiments(tracking_uri: str | None = None) -> dict[str, Any]:
    """
    Run all 4 experiments and log to MLflow.

    Returns dict of {experiment_name: {params, metrics, run_id}}
    """
    if tracking_uri:
        mlflow.set_tracking_uri(tracking_uri)
    else:
        # Default: local ./mlruns directory
        mlflow.set_tracking_uri("file:./mlruns")

    mlflow.set_experiment(EXPERIMENT_NAME)

    # ── Load data ────────────────────────────────────────────────────────
    print("📂 Loading data …")
    breeds, foods, interactions = load_all_data()

    results: dict[str, Any] = {}

    # ── Experiment 1: CBF Baseline ───────────────────────────────────────
    print("\n🔬 Experiment 1: CBF Baseline")
    t0 = time.time()
    cbf_metrics = run_cbf_experiment(breeds, foods, interactions, k=5)
    cbf_metrics["training_time_s"] = round(time.time() - t0, 2)

    cbf_params = {"method": "cbf", "k": 5}
    cbf_run_id = log_experiment(
        run_name="exp1_cbf_baseline",
        params=cbf_params,
        metrics=cbf_metrics,
    )
    results["exp1_cbf_baseline"] = {
        "params": cbf_params,
        "metrics": cbf_metrics,
        "run_id": cbf_run_id,
    }
    print(
        f"  Precision@5={cbf_metrics['precision_at_5']:.4f}  "
        f"NDCG@5={cbf_metrics['ndcg_at_5']:.4f}"
    )

    # ── Experiments 2–4: LightFM (requires LightFM installed) ───────────
    if not LIGHTFM_AVAILABLE:
        print("\n⚠ LightFM not available — skipping experiments 2–4.")
        print("  Install LightFM on Linux/GCP to run full pipeline.")
        _save_results(results)
        return results

    # Build LightFM dataset
    print("\n📦 Building LightFM dataset …")
    dataset, mappings = build_lightfm_dataset(foods, interactions)
    train_matrix, test_matrix = build_interaction_matrix(dataset, interactions)
    item_features = build_item_features(dataset, foods)

    print(
        f"  Train: {train_matrix.nnz} interactions, "
        f"Test: {test_matrix.nnz} interactions"
    )

    # Experiment configurations
    lightfm_configs = [
        {
            "name": "exp2_lightfm_warp_32",
            "run_name": "exp2_lightfm_warp_32",
            "params": {
                "method": "lightfm",
                "loss": "warp",
                "num_components": 32,
                "epochs": 30,
                "learning_rate": 0.05,
                "k": 5,
            },
        },
        {
            "name": "exp3_lightfm_warp_64",
            "run_name": "exp3_lightfm_warp_64",
            "params": {
                "method": "lightfm",
                "loss": "warp",
                "num_components": 64,
                "epochs": 50,
                "learning_rate": 0.05,
                "k": 5,
            },
        },
        {
            "name": "exp4_lightfm_bpr_32",
            "run_name": "exp4_lightfm_bpr_32",
            "params": {
                "method": "lightfm",
                "loss": "bpr",
                "num_components": 32,
                "epochs": 30,
                "learning_rate": 0.05,
                "k": 5,
            },
        },
    ]

    best_model = None
    best_precision = -1.0
    best_name = ""

    for config in lightfm_configs:
        name = config["name"]
        params = config["params"]
        print(
            f"\n🔬 {name}: loss={params['loss']}, "
            f"components={params['num_components']}, "
            f"epochs={params['epochs']}"
        )

        t0 = time.time()
        model = train_lightfm_model(
            loss=params["loss"],
            num_components=params["num_components"],
            epochs=params["epochs"],
            train_matrix=train_matrix,
            item_features=item_features,
            learning_rate=params["learning_rate"],
        )
        train_time = round(time.time() - t0, 2)

        metrics = evaluate_lightfm_model(
            model, test_matrix, train_matrix, item_features, k=5
        )
        metrics["training_time_s"] = train_time

        run_id = log_experiment(
            run_name=config["run_name"],
            params=params,
            metrics=metrics,
        )

        results[name] = {
            "params": params,
            "metrics": metrics,
            "run_id": run_id,
        }

        print(
            f"  Precision@5={metrics['precision_at_5']:.4f}  "
            f"NDCG@5={metrics['ndcg_at_5']:.4f}  "
            f"AUC={metrics['auc_score']:.4f}  "
            f"Time={train_time}s"
        )

        if metrics["precision_at_5"] > best_precision:
            best_precision = metrics["precision_at_5"]
            best_model = model
            best_name = name

    # ── Save best model ──────────────────────────────────────────────────
    if best_model is not None:
        print(f"\n🏆 Best model: {best_name} (Precision@5={best_precision:.4f})")
        _save_best_model(
            best_model, dataset, mappings, foods, breeds, best_name, results[best_name]
        )
        _register_best_model(best_name, results)

    _save_results(results)
    return results


# ════════════════════════════════════════════════════════════════════════════
#  MODEL PERSISTENCE
# ════════════════════════════════════════════════════════════════════════════


def _save_best_model(
    model: Any,
    dataset: Any,
    mappings: dict,
    foods: list[dict],
    breeds: list[dict],
    experiment_name: str,
    experiment_results: dict,
) -> Path:
    """Serialize the best model + all required artifacts to a single pickle."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODEL_DIR / "model.pkl"

    bundle = {
        "model": model,
        "dataset": dataset,
        "mappings": mappings,
        "foods": foods,
        "breeds": breeds,
        "experiment_name": experiment_name,
        "metrics": experiment_results["metrics"],
        "params": experiment_results["params"],
        "created_at": datetime.now().isoformat(),
        "version": "v1",
    }

    with open(model_path, "wb") as f:
        pickle.dump(bundle, f)

    print(f"  💾 Model saved: {model_path} ({model_path.stat().st_size / 1024:.0f} KB)")
    return model_path


def _register_best_model(best_name: str, results: dict) -> None:
    """Register the best model in MLflow Model Registry."""
    try:
        run_id = results[best_name]["run_id"]
        model_uri = f"runs:/{run_id}/model"

        # Register model
        registered = mlflow.register_model(
            model_uri=model_uri,
            name="pet-nutrition-recommender",
        )
        print(f"  📋 Registered model: {registered.name} v{registered.version}")

        # Transition to Production
        client = mlflow.tracking.MlflowClient()
        client.transition_model_version_stage(
            name="pet-nutrition-recommender",
            version=registered.version,
            stage="Production",
        )
        print(f"  🚀 Promoted to Production stage")

    except Exception as e:
        print(f"  ⚠ Model registration skipped: {e}")
        print(
            "    (This is normal when using file-based tracking without a registry server)"
        )


def _save_results(results: dict) -> None:
    """Save experiment comparison as JSON for the report."""
    output_path = (
        Path(__file__).resolve().parent.parent / "reports" / "experiment_results.json"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Convert to serializable format
    serializable = {}
    for name, data in results.items():
        serializable[name] = {
            "params": data["params"],
            "metrics": {k: round(v, 4) for k, v in data["metrics"].items()},
            "run_id": data["run_id"],
        }

    with open(output_path, "w") as f:
        json.dump(serializable, f, indent=2)

    print(f"\n📊 Results saved: {output_path}")


# ════════════════════════════════════════════════════════════════════════════
#  FINAL TRAINING (full dataset)
# ════════════════════════════════════════════════════════════════════════════


def train_final_model(
    best_params: dict[str, Any],
    tracking_uri: str | None = None,
) -> Path | None:
    """
    Train the final model on the FULL dataset (train + test combined)
    using the best hyperparameters from experiments.
    """
    if not LIGHTFM_AVAILABLE:
        print("⚠ LightFM not available — cannot train final model.")
        return None

    if tracking_uri:
        mlflow.set_tracking_uri(tracking_uri)

    mlflow.set_experiment(EXPERIMENT_NAME)

    breeds, foods, interactions = load_all_data()
    dataset, mappings = build_lightfm_dataset(foods, interactions)
    item_features = build_item_features(dataset, foods)

    # Build FULL interaction matrix (no split)
    full_matrix, _ = dataset.build_interactions(
        (i["user_id"], i["item_id"], i["rating"]) for i in interactions
    )

    print(
        f"\n🎓 Training final model on full dataset ({full_matrix.nnz} interactions) …"
    )

    model = train_lightfm_model(
        loss=best_params["loss"],
        num_components=best_params["num_components"],
        epochs=best_params.get("epochs", 50),
        train_matrix=full_matrix,
        item_features=item_features,
        learning_rate=best_params.get("learning_rate", 0.05),
    )

    # Save as final model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    final_path = MODEL_DIR / "model_v1_final.pkl"

    bundle = {
        "model": model,
        "dataset": dataset,
        "mappings": mappings,
        "foods": foods,
        "breeds": breeds,
        "experiment_name": "final_full_dataset",
        "params": best_params,
        "created_at": datetime.now().isoformat(),
        "version": "v1_final",
    }

    with open(final_path, "wb") as f:
        pickle.dump(bundle, f)

    # Log to MLflow
    with mlflow.start_run(run_name="final_v1_full_dataset"):
        mlflow.log_params(best_params)
        mlflow.log_param("dataset", "full")
        mlflow.log_param("total_interactions", full_matrix.nnz)
        mlflow.log_artifact(str(final_path))

    print(
        f"  💾 Final model saved: {final_path} ({final_path.stat().st_size / 1024:.0f} KB)"
    )
    return final_path


# ════════════════════════════════════════════════════════════════════════════
#  CLI
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train and evaluate recommendation models"
    )
    parser.add_argument(
        "--tracking-uri",
        type=str,
        default=None,
        help="MLflow tracking URI (default: file:./mlruns)",
    )
    parser.add_argument(
        "--final",
        action="store_true",
        help="Also train the final model on full dataset after experiments",
    )
    args = parser.parse_args()

    results = run_all_experiments(tracking_uri=args.tracking_uri)

    if args.final:
        # Use best LightFM config for final training
        best_name = None
        best_prec = -1.0
        for name, data in results.items():
            if data["params"].get("method") == "lightfm":
                if data["metrics"]["precision_at_5"] > best_prec:
                    best_prec = data["metrics"]["precision_at_5"]
                    best_name = name

        if best_name:
            train_final_model(
                results[best_name]["params"],
                tracking_uri=args.tracking_uri,
            )
        else:
            print("⚠ No LightFM results available for final training.")

    print("\n🎉 All experiments complete!")
