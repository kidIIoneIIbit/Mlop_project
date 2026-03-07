"""
RecommendationModel — Model Serving Interface
==============================================
Person C — ML / Data  |  Day 7 Deliverable

Wraps LightFM (or CBF fallback) for use by Person B's FastAPI backend.
The backend calls:
    model = RecommendationModel()
    model.load("path/to/model.pkl")
    results = model.recommend(pet_profile, top_k=6)
    info = model.get_model_info()
"""

from __future__ import annotations

import pickle
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np

# Add ml/ to path so we can import features
ML_DIR = Path(__file__).resolve().parent.parent.parent / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from features import (
    LIGHTFM_AVAILABLE,
    cbf_score,
    encode_food_features,
    encode_pet_features,
    score_all_foods,
)


# ════════════════════════════════════════════════════════════════════════════
#  DATA CLASSES
# ════════════════════════════════════════════════════════════════════════════


@dataclass
class ScoredFood:
    """A food item with its recommendation score and explanation."""

    food_id: str
    score: float
    name: str
    brand: str
    food_type: str
    species: str
    nutritional_content: dict
    tags: list[str]
    badges: list[str]
    price_usd: float
    avg_rating: float
    match_reasons: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "food_id": self.food_id,
            "score": float(self.score),
            "name": self.name,
            "brand": self.brand,
            "food_type": self.food_type,
            "species": self.species,
            "nutritional_content": self.nutritional_content,
            "tags": self.tags,
            "badges": self.badges,
            "price_usd": float(self.price_usd),
            "avg_rating": float(self.avg_rating),
            "match_reasons": self.match_reasons,
        }


# ════════════════════════════════════════════════════════════════════════════
#  MATCH REASON GENERATOR
# ════════════════════════════════════════════════════════════════════════════


def _generate_match_reasons(
    pet_profile: dict, food: dict, breed_targets: dict | None
) -> list[str]:
    """Generate up to 3 human-readable reasons why a food matches a pet."""
    reasons: list[str] = []
    nc = food.get("nutritional_content", {})
    tags = set(food.get("tags", []))

    # Protein adequacy
    if breed_targets and nc.get("protein", 0) >= breed_targets.get("protein_min", 0):
        reasons.append(
            f"Meets protein needs ({nc['protein']}% ≥ {breed_targets['protein_min']}% min)"
        )

    # Health condition match
    health_conditions = pet_profile.get("health_conditions", [])
    tag_map = {
        "joint": ["joint-support", "glucosamine"],
        "skin": ["skin-health", "omega-rich"],
        "kidney": ["kidney-support"],
        "digestive": ["sensitive-stomach", "easy-digest"],
        "weight": ["weight-management", "high-fiber"],
    }
    for cond in health_conditions:
        matching_tags = [t for t in tag_map.get(cond.lower(), []) if t in tags]
        if matching_tags:
            reasons.append(f"Supports {cond} health ({', '.join(matching_tags)})")

    # Life stage match
    age_years = pet_profile.get("age_years", 3)
    species = pet_profile.get("species", "dog")
    if species == "dog" and age_years < 1.5 and "puppy" in tags:
        reasons.append("Formulated for puppies")
    elif species == "cat" and age_years < 1 and "kitten" in tags:
        reasons.append("Formulated for kittens")
    elif (
        (species == "dog" and age_years >= 8) or (species == "cat" and age_years >= 10)
    ) and "senior" in tags:
        reasons.append("Formulated for seniors")

    # Vet recommended
    if "vet-recommended" in food.get("badges", []):
        reasons.append("Vet recommended")

    # High rating
    if food.get("avg_rating", 0) >= 4.5:
        reasons.append(f"Highly rated ({food['avg_rating']}★)")

    return reasons[:3]


# ════════════════════════════════════════════════════════════════════════════
#  RECOMMENDATION MODEL
# ════════════════════════════════════════════════════════════════════════════


class RecommendationModel:
    """
    Unified recommendation model wrapping LightFM + CBF fallback.

    Usage:
        model = RecommendationModel()
        model.load("backend/ml/model.pkl")
        results = model.recommend(pet_profile, top_k=6)
    """

    def __init__(self) -> None:
        self._model: Any = None  # LightFM model object
        self._dataset: Any = None  # LightFM Dataset
        self._mappings: dict = {}
        self._foods: list[dict] = []
        self._breeds: list[dict] = []
        self._metadata: dict = {}
        self._loaded: bool = False
        self._use_lightfm: bool = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self, path: str | Path) -> None:
        """
        Load model bundle from a pickle file.

        The pickle contains:
            model, dataset, mappings, foods, breeds, metadata
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")

        with open(path, "rb") as f:
            bundle = pickle.load(f)

        self._model = bundle.get("model")
        self._dataset = bundle.get("dataset")
        self._mappings = bundle.get("mappings", {})
        self._foods = bundle.get("foods", [])
        self._breeds = bundle.get("breeds", [])
        self._metadata = {
            "experiment_name": bundle.get("experiment_name", "unknown"),
            "version": bundle.get("version", "unknown"),
            "created_at": bundle.get("created_at", "unknown"),
            "params": bundle.get("params", {}),
            "metrics": bundle.get("metrics", {}),
        }

        self._use_lightfm = self._model is not None and LIGHTFM_AVAILABLE
        self._loaded = True

        mode = "LightFM" if self._use_lightfm else "CBF fallback"
        print(f"✅ Model loaded ({mode}): {self._metadata['version']}")

    def load_from_data(self, foods: list[dict], breeds: list[dict]) -> None:
        """
        Initialize for CBF-only mode (no LightFM model required).
        Useful for development / when model.pkl isn't available yet.
        """
        self._foods = foods
        self._breeds = breeds
        self._use_lightfm = False
        self._loaded = True
        self._metadata = {
            "experiment_name": "cbf_only",
            "version": "cbf_v1",
            "created_at": datetime.now().isoformat(),
            "params": {"method": "cbf"},
            "metrics": {},
        }
        print("✅ Model initialized in CBF-only mode")

    def recommend(self, pet_profile: dict, top_k: int = 6) -> list[ScoredFood]:
        """
        Generate top-k food recommendations for a pet profile.

        Args:
            pet_profile: dict with keys:
                species, size, age_years, activity_level,
                health_conditions (list), breed_id (optional)
            top_k: Number of recommendations to return.

        Returns:
            List of ScoredFood objects, ranked by score descending.
        """
        if not self._loaded:
            raise RuntimeError(
                "Model not loaded. Call load() or load_from_data() first."
            )

        if self._use_lightfm:
            return self._recommend_lightfm(pet_profile, top_k)
        else:
            return self._recommend_cbf(pet_profile, top_k)

    def _recommend_cbf(self, pet_profile: dict, top_k: int) -> list[ScoredFood]:
        """CBF fallback recommendation."""
        top_foods = score_all_foods(pet_profile, self._foods, self._breeds, top_k=top_k)

        # Find breed targets for match reasons
        breed_targets = self._get_breed_targets(pet_profile)

        results: list[ScoredFood] = []
        for item in top_foods:
            food = item["food"]
            reasons = _generate_match_reasons(pet_profile, food, breed_targets)
            results.append(
                ScoredFood(
                    food_id=food["id"],
                    score=round(item["score"], 2),
                    name=food["name"],
                    brand=food["brand"],
                    food_type=food["food_type"],
                    species=food["species"],
                    nutritional_content=food["nutritional_content"],
                    tags=food["tags"],
                    badges=food.get("badges", []),
                    price_usd=food["price_usd"],
                    avg_rating=food["avg_rating"],
                    match_reasons=reasons,
                )
            )
        return results

    def _recommend_lightfm(self, pet_profile: dict, top_k: int) -> list[ScoredFood]:
        """LightFM-based recommendation with side features."""
        from features import build_item_features

        item_id_map = self._mappings.get("item_id_map", {})
        if not item_id_map:
            # Fallback to CBF
            return self._recommend_cbf(pet_profile, top_k)

        # Build item features matrix
        item_features = build_item_features(self._dataset, self._foods)

        # Filter to species-appropriate foods
        species = pet_profile["species"]
        species_foods = [f for f in self._foods if f["species"] == species]
        species_item_indices = []
        species_food_map = {}

        for food in species_foods:
            if food["id"] in item_id_map:
                idx = item_id_map[food["id"]]
                species_item_indices.append(idx)
                species_food_map[idx] = food

        if not species_item_indices:
            return self._recommend_cbf(pet_profile, top_k)

        # Use user index 0 as a proxy (cold-start — rely on item features)
        item_indices = np.array(species_item_indices)
        scores = self._model.predict(0, item_indices, item_features=item_features)

        # Rank by score
        ranked_indices = np.argsort(-scores)[:top_k]
        breed_targets = self._get_breed_targets(pet_profile)

        results: list[ScoredFood] = []
        max_score = scores.max() if len(scores) > 0 else 1.0
        min_score = scores.min() if len(scores) > 0 else 0.0
        score_range = max_score - min_score if max_score != min_score else 1.0

        for rank_pos in ranked_indices:
            item_idx = item_indices[rank_pos]
            food = species_food_map[item_idx]

            # Normalize score to 0–100
            normalized_score = ((scores[rank_pos] - min_score) / score_range) * 100
            normalized_score = round(max(0, min(100, normalized_score)), 2)

            reasons = _generate_match_reasons(pet_profile, food, breed_targets)
            results.append(
                ScoredFood(
                    food_id=food["id"],
                    score=normalized_score,
                    name=food["name"],
                    brand=food["brand"],
                    food_type=food["food_type"],
                    species=food["species"],
                    nutritional_content=food["nutritional_content"],
                    tags=food["tags"],
                    badges=food.get("badges", []),
                    price_usd=food["price_usd"],
                    avg_rating=food["avg_rating"],
                    match_reasons=reasons,
                )
            )

        return results

    def _get_breed_targets(self, pet_profile: dict) -> dict | None:
        """Find nutritional targets for the pet's breed."""
        breed_id = pet_profile.get("breed_id")
        if breed_id:
            for b in self._breeds:
                if b["id"] == breed_id:
                    return b["nutritional_targets"]

        # Fallback: average targets for species
        species_breeds = [
            b for b in self._breeds if b["species"] == pet_profile.get("species")
        ]
        if species_breeds:
            return {
                "protein_min": np.mean(
                    [b["nutritional_targets"]["protein_min"] for b in species_breeds]
                ),
                "fat_min": np.mean(
                    [b["nutritional_targets"]["fat_min"] for b in species_breeds]
                ),
                "fiber_min": np.mean(
                    [b["nutritional_targets"]["fiber_min"] for b in species_breeds]
                ),
                "calorie_range": [
                    np.mean(
                        [
                            b["nutritional_targets"]["calorie_range"][0]
                            for b in species_breeds
                        ]
                    ),
                    np.mean(
                        [
                            b["nutritional_targets"]["calorie_range"][1]
                            for b in species_breeds
                        ]
                    ),
                ],
            }
        return None

    def get_model_info(self) -> dict:
        """Return model metadata: version, training date, metrics."""
        if not self._loaded:
            return {"status": "not_loaded"}

        return {
            "status": "loaded",
            "mode": "lightfm" if self._use_lightfm else "cbf",
            "version": self._metadata.get("version", "unknown"),
            "experiment": self._metadata.get("experiment_name", "unknown"),
            "created_at": self._metadata.get("created_at", "unknown"),
            "params": self._metadata.get("params", {}),
            "metrics": self._metadata.get("metrics", {}),
            "total_foods": len(self._foods),
            "total_breeds": len(self._breeds),
        }


# ════════════════════════════════════════════════════════════════════════════
#  MAIN (integration test)
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import json

    DATA_DIR = Path(__file__).resolve().parent.parent / "data"

    # Load data for CBF mode
    with open(DATA_DIR / "breeds.json") as f:
        breeds = json.load(f)
    with open(DATA_DIR / "foods.json") as f:
        foods = json.load(f)

    # Initialize model in CBF mode
    model = RecommendationModel()
    model.load_from_data(foods, breeds)

    # Test with 5 different pet profiles
    test_profiles = [
        {
            "species": "dog",
            "size": "large",
            "age_years": 5,
            "activity_level": "high",
            "health_conditions": ["joint", "skin"],
            "breed_id": "dog-breed-001",
            "label": "Labrador (active, joint+skin)",
        },
        {
            "species": "cat",
            "size": "medium",
            "age_years": 12,
            "activity_level": "low",
            "health_conditions": ["kidney"],
            "breed_id": "cat-breed-001",
            "label": "Persian (senior, kidney)",
        },
        {
            "species": "dog",
            "size": "medium",
            "age_years": 0.8,
            "activity_level": "high",
            "health_conditions": [],
            "breed_id": "dog-breed-005",
            "label": "Beagle (puppy, no issues)",
        },
        {
            "species": "cat",
            "size": "medium",
            "age_years": 4,
            "activity_level": "medium",
            "health_conditions": ["digestive"],
            "breed_id": "cat-breed-003",
            "label": "Siamese (adult, digestive)",
        },
        {
            "species": "dog",
            "size": "medium",
            "age_years": 9,
            "activity_level": "low",
            "health_conditions": ["joint", "weight"],
            "breed_id": "dog-breed-007",
            "label": "Bulldog (senior, joint+weight)",
        },
    ]

    print("🧪 Integration Test — RecommendationModel (CBF mode)\n")

    for profile in test_profiles:
        label = profile.pop("label")
        print(f"📋 {label}")
        results = model.recommend(profile, top_k=6)

        assert len(results) == 6, f"Expected 6 results, got {len(results)}"

        for r in results:
            assert 0 <= r.score <= 100, f"Score {r.score} out of range"
            reasons_str = " | ".join(r.match_reasons) if r.match_reasons else "—"
            print(f"   {r.score:5.1f}  {r.name:45s}  {reasons_str}")
        print()

    # Test model info
    info = model.get_model_info()
    print(f"ℹ Model info: {json.dumps(info, indent=2)}")
    print("\n✅ All integration tests passed.")
