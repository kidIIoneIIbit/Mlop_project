from __future__ import annotations

import pickle
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np

# Add ml/ to path so we can import features
ML_DIR = Path(__file__).resolve().parent
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
            "food_id":             self.food_id,
            "score":               self.score,
            "name":                self.name,
            "brand":               self.brand,
            "food_type":           self.food_type,
            "species":             self.species,
            "nutritional_content": self.nutritional_content,
            "tags":                self.tags,
            "badges":              self.badges,
            "price_usd":           self.price_usd,
            "avg_rating":          self.avg_rating,
            "match_reasons":       self.match_reasons,
        }


# ════════════════════════════════════════════════════════════════════════════
#  MATCH REASON GENERATOR
# ════════════════════════════════════════════════════════════════════════════


def _generate_match_reasons(
    pet_profile: dict, food: dict, breed_targets: dict | None
) -> list[str]:
    """Generate up to 3 human-readable reasons why a food matches a pet."""
    reasons: list[str] = []
    nc   = food.get("nutritional_content", {})
    tags = set(food.get("tags", []))

    # Protein adequacy
    if breed_targets and nc.get("protein", 0) >= breed_targets.get("protein_min", 0):
        reasons.append(
            f"Meets protein needs ({nc['protein']}% ≥ {breed_targets['protein_min']}% min)"
        )

    # Health condition match
    tag_map = {
        "joint":     ["joint-support", "glucosamine"],
        "skin":      ["skin-health", "omega-rich"],
        "kidney":    ["kidney-support"],
        "digestive": ["sensitive-stomach", "easy-digest"],
        "weight":    ["weight-management", "high-fiber"],
    }
    for cond in pet_profile.get("health_conditions", []):
        matching_tags = [t for t in tag_map.get(cond.lower(), []) if t in tags]
        if matching_tags:
            reasons.append(f"Supports {cond} health ({', '.join(matching_tags)})")

    # Life stage
    age     = pet_profile.get("age_years", 3)
    species = pet_profile.get("species", "dog")
    if species == "dog" and age < 1.5 and "puppy" in tags:
        reasons.append("Formulated for puppies")
    elif species == "cat" and age < 1 and "kitten" in tags:
        reasons.append("Formulated for kittens")
    elif ((species == "dog" and age >= 8) or (species == "cat" and age >= 10)) and "senior" in tags:
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
    def __init__(self) -> None:
        self._model: Any    = None
        self._dataset: Any  = None
        self._mappings: dict = {}
        self._foods: list[dict]  = []
        self._breeds: list[dict] = []
        self._metadata: dict     = {}
        self._loaded: bool       = False
        self._use_lightfm: bool  = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self, path: str | Path) -> None:
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")

        with open(path, "rb") as f:
            bundle = pickle.load(f)

        self._model    = bundle.get("model")
        self._dataset  = bundle.get("dataset")
        self._mappings = bundle.get("mappings", {})
        self._foods    = bundle.get("foods", [])
        self._breeds   = bundle.get("breeds", [])
        self._metadata = {
            "experiment_name": bundle.get("experiment_name", "unknown"),
            "version":         bundle.get("version", "unknown"),
            "created_at":      bundle.get("created_at", "unknown"),
            "params":          bundle.get("params", {}),
            "metrics":         bundle.get("metrics", {}),
        }

        self._use_lightfm = self._model is not None and LIGHTFM_AVAILABLE
        self._loaded = True

        mode = "LightFM" if self._use_lightfm else "CBF fallback"
        print(f"[OK] Model loaded ({mode}): {self._metadata['version']}")

    def load_from_data(self, foods: list[dict], breeds: list[dict]) -> None:
        """CBF-only mode — no LightFM model required."""
        self._foods   = foods
        self._breeds  = breeds
        self._use_lightfm = False
        self._loaded  = True
        self._metadata = {
            "experiment_name": "cbf_only",
            "version":         "cbf_v1",
            "created_at":      datetime.now().isoformat(),
            "params":          {"method": "cbf"},
            "metrics":         {},
        }
        print("[OK] Model initialized in CBF-only mode")

    def recommend(self, pet_profile: dict, top_k: int = 6) -> list[ScoredFood]:
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load() or load_from_data() first.")

        if self._use_lightfm:
            return self._recommend_lightfm(pet_profile, top_k)
        else:
            return self._recommend_cbf(pet_profile, top_k)

    def _recommend_cbf(self, pet_profile: dict, top_k: int) -> list[ScoredFood]:
        top_foods     = score_all_foods(pet_profile, self._foods, self._breeds, top_k=top_k)
        breed_targets = self._get_breed_targets(pet_profile)

        results: list[ScoredFood] = []
        for item in top_foods:
            food    = item["food"]
            reasons = _generate_match_reasons(pet_profile, food, breed_targets)
            results.append(ScoredFood(
                food_id             = food["id"],
                score               = round(item["score"], 2),
                name                = food["name"],
                brand               = food["brand"],
                food_type           = food["food_type"],
                species             = food["species"],
                nutritional_content = food["nutritional_content"],
                tags                = food["tags"],
                badges              = food.get("badges", []),
                price_usd           = food["price_usd"],
                avg_rating          = food["avg_rating"],
                match_reasons       = reasons,
            ))
        return results

    def _recommend_lightfm(self, pet_profile: dict, top_k: int) -> list[ScoredFood]:
        from features import build_item_features

        item_id_map = self._mappings.get("item_id_map", {})
        if not item_id_map:
            return self._recommend_cbf(pet_profile, top_k)

        item_features = build_item_features(self._dataset, self._foods)

        species      = pet_profile["species"]
        species_foods = [f for f in self._foods if f["species"] == species]
        species_item_indices: list[int] = []
        species_food_map: dict[int, dict] = {}

        for food in species_foods:
            if food["id"] in item_id_map:
                idx = item_id_map[food["id"]]
                species_item_indices.append(idx)
                species_food_map[idx] = food

        if not species_item_indices:
            return self._recommend_cbf(pet_profile, top_k)

        item_indices   = np.array(species_item_indices)
        scores         = self._model.predict(0, item_indices, item_features=item_features)
        ranked_indices = np.argsort(-scores)[:top_k]
        breed_targets  = self._get_breed_targets(pet_profile)

        max_score  = scores.max() if len(scores) > 0 else 1.0
        min_score  = scores.min() if len(scores) > 0 else 0.0
        score_range = max_score - min_score if max_score != min_score else 1.0

        results: list[ScoredFood] = []
        for rank_pos in ranked_indices:
            item_idx = item_indices[rank_pos]
            food     = species_food_map[item_idx]
            norm     = round(max(0, min(100, ((scores[rank_pos] - min_score) / score_range) * 100)), 2)
            reasons  = _generate_match_reasons(pet_profile, food, breed_targets)
            results.append(ScoredFood(
                food_id             = food["id"],
                score               = norm,
                name                = food["name"],
                brand               = food["brand"],
                food_type           = food["food_type"],
                species             = food["species"],
                nutritional_content = food["nutritional_content"],
                tags                = food["tags"],
                badges              = food.get("badges", []),
                price_usd           = food["price_usd"],
                avg_rating          = food["avg_rating"],
                match_reasons       = reasons,
            ))

        return results

    def _get_breed_targets(self, pet_profile: dict) -> dict | None:
        breed_id = pet_profile.get("breed_id")
        if breed_id:
            for b in self._breeds:
                if b["id"] == breed_id:
                    return b["nutritional_targets"]

        species_breeds = [b for b in self._breeds if b["species"] == pet_profile.get("species")]
        if species_breeds:
            return {
                "protein_min": np.mean([b["nutritional_targets"]["protein_min"] for b in species_breeds]),
                "fat_min":     np.mean([b["nutritional_targets"]["fat_min"]     for b in species_breeds]),
                "fiber_min":   np.mean([b["nutritional_targets"]["fiber_min"]   for b in species_breeds]),
            }
        return None

    def get_model_info(self) -> dict:
        if not self._loaded:
            return {"status": "not_loaded"}
        return {
            "status":        "loaded",
            "mode":          "lightfm" if self._use_lightfm else "cbf",
            "version":       self._metadata.get("version", "unknown"),
            "experiment":    self._metadata.get("experiment_name", "unknown"),
            "created_at":    self._metadata.get("created_at", "unknown"),
            "params":        self._metadata.get("params", {}),
            "metrics":       self._metadata.get("metrics", {}),
            "total_foods":   len(self._foods),
            "total_breeds":  len(self._breeds),
        }
