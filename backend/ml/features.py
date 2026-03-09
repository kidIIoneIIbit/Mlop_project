"""
features.py — CBF scoring and LightFM feature encoding utilities.
Imported by ml/model.py and ml/load_model.py.
"""
from __future__ import annotations

from typing import Optional

# ── LightFM availability check ────────────────────────────────────────────
try:
    import lightfm  # noqa: F401
    LIGHTFM_AVAILABLE = True
except ImportError:
    LIGHTFM_AVAILABLE = False

# ── Tag mapping: health condition keys → relevant food tags ──────────────
_CONDITION_TAG_MAP: dict[str, list[str]] = {
    "joint":     ["joint-support", "glucosamine"],
    "skin":      ["skin-health", "omega-rich", "allergy-friendly"],
    "kidney":    ["kidney-support", "kidney-care"],
    "digestive": ["sensitive-stomach", "easy-digest", "digestive-care"],
    "weight":    ["weight-management", "weight-control", "high-fiber"],
}


def cbf_score(
    pet_profile: dict,
    food: dict,
    breed_targets: Optional[dict] = None,
    breed: Optional[dict] = None,
) -> float:
    """
    Content-Based Filtering score for a food given a pet profile.
    Returns a float in [0, 100].
    """
    # Hard filter: wrong species = 0
    if food.get("species") != pet_profile.get("species"):
        return 0.0

    score = 0.0
    nc     = food.get("nutritional_content", {})
    tags   = set(food.get("tags", []))
    badges = set(food.get("badges", []))

    # 1. Health condition tag overlap (max 40 pts)
    health_conditions = pet_profile.get("health_conditions", [])
    cond_score = 0.0
    for cond in health_conditions:
        for tag in _CONDITION_TAG_MAP.get(cond, []):
            if tag in tags or tag in badges:
                cond_score += 12
                break
    score += min(cond_score, 40)

    # 2. Protein adequacy vs breed targets (20 pts)
    if breed_targets:
        protein_min = breed_targets.get("protein_min", 0)
        if nc.get("protein", 0) >= protein_min:
            score += 20
        else:
            score -= 5

    # 3. Fat & weight tendency (15 pts)
    if breed and breed_targets:
        fat_min = breed_targets.get("fat_min", 0)
        if breed.get("weight_tendency") == "overweight":
            if nc.get("fat", 0) <= fat_min:
                score += 15
        else:
            score += 10

    # 4. Life stage match (10 pts)
    age     = pet_profile.get("age_years", 3)
    species = pet_profile.get("species", "dog")
    if species == "dog":
        if age < 1.5 and "puppy" in tags:
            score += 10
        elif age >= 8 and "senior" in tags:
            score += 10
        elif 1.5 <= age < 8 and "puppy" not in tags:
            score += 5
    elif species == "cat":
        if age < 1 and "kitten" in tags:
            score += 10
        elif age >= 10 and "senior" in tags:
            score += 10
        elif 1 <= age < 10:
            score += 5

    # 5. Rating bonus (max 15 pts)
    rating = float(food.get("avg_rating", 0))
    score += min(max(0.0, (rating - 3.0) * 7.5), 15.0)

    # 6. Vet recommended badge bonus (5 pts)
    if "vet-recommended" in badges:
        score += 5

    return max(0.0, min(100.0, round(score, 2)))


def score_all_foods(
    pet_profile: dict,
    foods: list[dict],
    breeds: list[dict],
    top_k: int = 6,
) -> list[dict]:
    """
    Score all foods for a pet profile and return the top-k results.

    Returns:
        List of {"food": food_dict, "score": float}, sorted descending.
    """
    import numpy as np

    # Resolve breed & breed_targets
    breed: Optional[dict] = None
    breed_targets: Optional[dict] = None
    breed_id = pet_profile.get("breed_id")
    species  = pet_profile.get("species")

    if breed_id:
        for b in breeds:
            if b["id"] == breed_id:
                breed = b
                breed_targets = b.get("nutritional_targets")
                break

    # Fallback: average targets for species
    if breed_targets is None:
        species_breeds = [b for b in breeds if b.get("species") == species]
        if species_breeds:
            breed_targets = {
                "protein_min": float(np.mean([b["nutritional_targets"]["protein_min"] for b in species_breeds])),
                "fat_min":     float(np.mean([b["nutritional_targets"]["fat_min"]     for b in species_breeds])),
                "fiber_min":   float(np.mean([b["nutritional_targets"]["fiber_min"]   for b in species_breeds])),
            }

    scored = [
        {"food": food, "score": cbf_score(pet_profile, food, breed_targets, breed)}
        for food in foods
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


# ── LightFM feature encoding ──────────────────────────────────────────────

def encode_food_features(food: dict) -> list[str]:
    """Encode a food item into feature strings for LightFM."""
    features = [
        f"species:{food.get('species', 'unknown')}",
        f"food_type:{food.get('food_type', 'unknown')}",
    ]
    for tag in food.get("tags", []):
        features.append(f"tag:{tag}")
    for badge in food.get("badges", []):
        features.append(f"badge:{badge}")
    return features


def encode_pet_features(pet_profile: dict) -> list[str]:
    """Encode a pet profile into feature strings for LightFM."""
    features = [
        f"species:{pet_profile.get('species', 'unknown')}",
        f"activity:{pet_profile.get('activity_level', 'medium')}",
    ]
    for cond in pet_profile.get("health_conditions", []):
        features.append(f"condition:{cond}")

    age     = pet_profile.get("age_years", 3)
    species = pet_profile.get("species", "dog")
    if species == "dog":
        life_stage = "puppy" if age < 1.5 else ("senior" if age >= 8 else "adult")
    else:
        life_stage = "kitten" if age < 1 else ("senior" if age >= 10 else "adult")
    features.append(f"life_stage:{life_stage}")
    return features


def build_item_features(dataset, foods: list[dict]):
    """Build a LightFM item-features sparse matrix."""
    if not LIGHTFM_AVAILABLE or dataset is None:
        return None
    feature_lists = [
        (food["id"], encode_food_features(food))
        for food in foods
    ]
    return dataset.build_item_features(feature_lists)
