"""
Feature Engineering for Pet Nutrition Recommender
=================================================
Person C — ML / Data  |  Day 3–4 Deliverable

Encodes pet profiles and food items as feature vectors for LightFM,
and provides a content-based filtering (CBF) baseline scorer.
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import numpy as np
from scipy.sparse import coo_matrix

# LightFM requires C compilation — lazy import for environments where it's
# not available (e.g. Windows without proper build tools).  Full pipeline
# works on Linux / GCP Cloud Run.
try:
    from lightfm.data import Dataset

    LIGHTFM_AVAILABLE = True
except ImportError:
    Dataset = None  # type: ignore[misc,assignment]
    LIGHTFM_AVAILABLE = False

# ── Constants ────────────────────────────────────────────────────────────────
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

SIZES = ["small", "medium", "large"]
AGE_GROUPS = ["puppy", "adult", "senior"]  # also covers kitten
ACTIVITY_LEVELS = ["low", "medium", "high"]
HEALTH_CONDITIONS = [
    "joint",
    "skin",
    "kidney",
    "digestive",
    "weight",
    "dental",
    "heart",
    "eye",
]
FOOD_TYPES = ["dry", "wet", "raw"]
PROTEIN_BINS = ["protein_low", "protein_med", "protein_high"]
FAT_BINS = ["fat_low", "fat_med", "fat_high"]

# Tags that appear across food items (used as binary flags)
ALL_TAGS = [
    "grain-free",
    "organic",
    "high-protein",
    "weight-management",
    "joint-support",
    "senior",
    "puppy",
    "kitten",
    "omega-rich",
    "skin-health",
    "sensitive-stomach",
    "indoor",
    "hairball-control",
    "hypoallergenic",
    "raw-diet",
    "budget-friendly",
    "urinary-health",
    "kidney-support",
    "high-fiber",
    "easy-digest",
    "high-calorie",
    "veterinary",
    "glucosamine",
]

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"


# ════════════════════════════════════════════════════════════════════════════
#  DATA LOADING
# ════════════════════════════════════════════════════════════════════════════


def load_json(filename: str, data_dir: Path = DATA_DIR) -> list[dict]:
    with open(data_dir / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all_data(
    data_dir: Path = DATA_DIR,
) -> tuple[list[dict], list[dict], list[dict]]:
    """Load breeds, foods, and interactions from JSON files."""
    return (
        load_json("breeds.json", data_dir),
        load_json("foods.json", data_dir),
        load_json("interactions.json", data_dir),
    )


# ════════════════════════════════════════════════════════════════════════════
#  PET FEATURE ENCODING
# ════════════════════════════════════════════════════════════════════════════


def _bin_age(age_years: float, species: str) -> str:
    """Map age in years to age group."""
    if species == "dog":
        if age_years < 1.5:
            return "puppy"
        elif age_years >= 8:
            return "senior"
        return "adult"
    else:  # cat
        if age_years < 1:
            return "puppy"  # kitten maps to same label
        elif age_years >= 10:
            return "senior"
        return "adult"


def encode_pet_features(pet_profile: dict) -> list[str]:
    """
    Encode a pet profile into a list of string feature labels.

    Expected pet_profile keys:
        species, size, age_years, activity_level, health_conditions (list)

    Returns list like: ['species:dog', 'size:large', 'age_group:adult',
                        'activity:high', 'health:joint', 'health:skin']
    """
    features: list[str] = []

    features.append(f"species:{pet_profile['species']}")
    features.append(f"size:{pet_profile.get('size', 'medium')}")

    age_group = _bin_age(pet_profile.get("age_years", 3), pet_profile["species"])
    features.append(f"age_group:{age_group}")

    features.append(f"activity:{pet_profile.get('activity_level', 'medium')}")

    for condition in pet_profile.get("health_conditions", []):
        cond_lower = condition.lower()
        if cond_lower in HEALTH_CONDITIONS:
            features.append(f"health:{cond_lower}")

    return features


# ════════════════════════════════════════════════════════════════════════════
#  FOOD FEATURE ENCODING
# ════════════════════════════════════════════════════════════════════════════


def _bin_nutrient(value: float, thresholds: tuple[float, float]) -> str:
    """Bin a nutrient into low / med / high."""
    if value < thresholds[0]:
        return "low"
    elif value > thresholds[1]:
        return "high"
    return "med"


def encode_food_features(food: dict) -> list[str]:
    """
    Encode a food item into a list of string feature labels.

    Returns list like: ['food_type:dry', 'protein_high', 'fat_med',
                        'tag:grain-free', 'tag:omega-rich']
    """
    features: list[str] = []

    features.append(f"species:{food['species']}")
    features.append(f"food_type:{food['food_type']}")

    nc = food["nutritional_content"]
    protein_bin = _bin_nutrient(nc["protein"], (24, 34))
    features.append(f"protein_{protein_bin}")

    fat_bin = _bin_nutrient(nc["fat"], (10, 16))
    features.append(f"fat_{fat_bin}")

    for tag in food.get("tags", []):
        if tag in ALL_TAGS:
            features.append(f"tag:{tag}")

    return features


# ════════════════════════════════════════════════════════════════════════════
#  ALL POSSIBLE FEATURE LABELS
# ════════════════════════════════════════════════════════════════════════════


def get_all_user_feature_labels() -> list[str]:
    """Return the full vocabulary of user (pet) feature labels."""
    labels: list[str] = []
    for sp in ["dog", "cat"]:
        labels.append(f"species:{sp}")
    for sz in SIZES:
        labels.append(f"size:{sz}")
    for ag in AGE_GROUPS:
        labels.append(f"age_group:{ag}")
    for al in ACTIVITY_LEVELS:
        labels.append(f"activity:{al}")
    for hc in HEALTH_CONDITIONS:
        labels.append(f"health:{hc}")
    return labels


def get_all_item_feature_labels() -> list[str]:
    """Return the full vocabulary of item (food) feature labels."""
    labels: list[str] = []
    for sp in ["dog", "cat"]:
        labels.append(f"species:{sp}")
    for ft in FOOD_TYPES:
        labels.append(f"food_type:{ft}")
    for pb in PROTEIN_BINS:
        labels.append(pb)
    for fb in FAT_BINS:
        labels.append(fb)
    for tag in ALL_TAGS:
        labels.append(f"tag:{tag}")
    return labels


# ════════════════════════════════════════════════════════════════════════════
#  LIGHTFM DATASET CONSTRUCTION
# ════════════════════════════════════════════════════════════════════════════


def build_lightfm_dataset(
    foods: list[dict], interactions: list[dict]
) -> tuple[Dataset, dict]:
    """
    Build a LightFM Dataset with user and item side features.

    Returns:
        (dataset, mappings) where mappings is a dict with keys:
            user_id_map, item_id_map, user_feature_labels, item_feature_labels
    """
    user_ids = sorted({i["user_id"] for i in interactions})
    item_ids = sorted({f["id"] for f in foods})

    user_feature_labels = get_all_user_feature_labels()
    item_feature_labels = get_all_item_feature_labels()

    dataset = Dataset()
    dataset.fit(
        users=user_ids,
        items=item_ids,
        user_features=user_feature_labels,
        item_features=item_feature_labels,
    )

    mappings = {
        "user_id_map": {uid: idx for idx, uid in enumerate(user_ids)},
        "item_id_map": {iid: idx for idx, iid in enumerate(item_ids)},
        "user_feature_labels": user_feature_labels,
        "item_feature_labels": item_feature_labels,
    }

    return dataset, mappings


def build_interaction_matrix(
    dataset: Dataset,
    interactions: list[dict],
    test_ratio: float = 0.2,
) -> tuple[coo_matrix, coo_matrix]:
    """
    Build train and test interaction matrices (80/20 split).

    Returns:
        (train_matrix, test_matrix) — both in COO format
    """
    # Shuffle interactions deterministically
    shuffled = interactions.copy()
    random.shuffle(shuffled)

    split_idx = int(len(shuffled) * (1 - test_ratio))
    train_ints = shuffled[:split_idx]
    test_ints = shuffled[split_idx:]

    train_matrix, _ = dataset.build_interactions(
        (i["user_id"], i["item_id"], i["rating"]) for i in train_ints
    )
    test_matrix, _ = dataset.build_interactions(
        (i["user_id"], i["item_id"], i["rating"]) for i in test_ints
    )

    return train_matrix, test_matrix


def build_item_features(dataset: Dataset, foods: list[dict]) -> Any:
    """Build LightFM item feature matrix from food data."""
    item_features_list = []
    for food in foods:
        features = encode_food_features(food)
        item_features_list.append((food["id"], features))

    return dataset.build_item_features(item_features_list)


# ════════════════════════════════════════════════════════════════════════════
#  CBF BASELINE SCORER
# ════════════════════════════════════════════════════════════════════════════


def cbf_score(pet_profile: dict, food: dict, breed_targets: dict) -> float:
    """
    Content-based filtering baseline score.

    Computes a 0–100 match score between a food item and a pet profile
    based on how well the food's nutrients meet the breed's nutritional targets.

    Components:
        1. Species match (mandatory — 0 if mismatch)
        2. Protein adequacy (25%)
        3. Fat adequacy (25%)
        4. Fiber adequacy (15%)
        5. Calorie fit (20%)
        6. Tag relevance bonus (15%)
    """
    # Species gate — must match
    if food["species"] != pet_profile["species"]:
        return 0.0

    nc = food["nutritional_content"]
    nt = breed_targets

    score = 0.0

    # ── Protein adequacy (25 pts) ───────────────────────────────────────
    if nc["protein"] >= nt["protein_min"]:
        score += 25.0
    else:
        score += 25.0 * (nc["protein"] / nt["protein_min"])

    # ── Fat adequacy (25 pts) ───────────────────────────────────────────
    if nc["fat"] >= nt["fat_min"]:
        score += 25.0
    else:
        score += 25.0 * (nc["fat"] / nt["fat_min"])

    # ── Fiber adequacy (15 pts) ─────────────────────────────────────────
    if nc["fiber"] >= nt["fiber_min"]:
        score += 15.0
    else:
        score += 15.0 * (nc["fiber"] / nt["fiber_min"])

    # ── Calorie fit (20 pts) ────────────────────────────────────────────
    # For wet/raw foods, kcal_per_100g is expected to be lower per serving
    # We check if the food's caloric density is reasonable for the breed
    cal_min, cal_max = nt["calorie_range"]
    # Normalize kcal_per_100g to daily estimate (rough: assume ~300g dry, ~800g wet daily)
    if food["food_type"] == "dry":
        daily_estimate = nc["kcal_per_100g"] * 3.0
    elif food["food_type"] == "wet":
        daily_estimate = nc["kcal_per_100g"] * 8.0
    else:  # raw
        daily_estimate = nc["kcal_per_100g"] * 4.0

    if cal_min <= daily_estimate <= cal_max:
        score += 20.0
    elif daily_estimate < cal_min:
        score += 20.0 * max(0.5, daily_estimate / cal_min)
    else:
        score += 20.0 * max(0.5, cal_max / daily_estimate)

    # ── Tag relevance bonus (15 pts) ────────────────────────────────────
    bonus_tags = set()
    health_conditions = pet_profile.get("health_conditions", [])
    for cond in health_conditions:
        cond_lower = cond.lower()
        if cond_lower == "joint":
            bonus_tags.update(["joint-support", "glucosamine"])
        elif cond_lower == "skin":
            bonus_tags.update(["skin-health", "omega-rich"])
        elif cond_lower == "kidney":
            bonus_tags.add("kidney-support")
        elif cond_lower == "digestive":
            bonus_tags.update(["sensitive-stomach", "easy-digest"])
        elif cond_lower == "weight":
            bonus_tags.update(["weight-management", "high-fiber"])

    age_group = _bin_age(pet_profile.get("age_years", 3), pet_profile["species"])
    if age_group == "puppy":
        bonus_tags.update(["puppy", "kitten", "growth-support"])
    elif age_group == "senior":
        bonus_tags.update(["senior", "easy-digest"])

    food_tags = set(food.get("tags", []))
    if bonus_tags:
        tag_overlap = len(food_tags & bonus_tags) / len(bonus_tags)
        score += 15.0 * tag_overlap
    else:
        # No special needs → give partial credit
        score += 7.5

    return round(min(100.0, score), 2)


# ════════════════════════════════════════════════════════════════════════════
#  CONVENIENCE: Score all foods for a pet
# ════════════════════════════════════════════════════════════════════════════


def score_all_foods(
    pet_profile: dict, foods: list[dict], breeds: list[dict], top_k: int = 6
) -> list[dict]:
    """
    Score all species-appropriate foods for a pet and return top-k.

    Returns list of dicts: [{food_id, score, food}, ...]
    """
    # Find breed targets
    breed_id = pet_profile.get("breed_id")
    breed_targets = None
    for b in breeds:
        if b["id"] == breed_id:
            breed_targets = b["nutritional_targets"]
            break

    if breed_targets is None:
        # Fallback: use average targets for species
        species_breeds = [b for b in breeds if b["species"] == pet_profile["species"]]
        if species_breeds:
            breed_targets = {
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
        else:
            breed_targets = {
                "protein_min": 25,
                "fat_min": 10,
                "fiber_min": 3,
                "calorie_range": [500, 1500],
            }

    scored = []
    for food in foods:
        s = cbf_score(pet_profile, food, breed_targets)
        if s > 0:
            scored.append({"food_id": food["id"], "score": s, "food": food})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


# ════════════════════════════════════════════════════════════════════════════
#  MAIN (for testing)
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    breeds, foods, interactions = load_all_data()

    # Test pet feature encoding
    test_pet = {
        "species": "dog",
        "size": "large",
        "age_years": 5,
        "activity_level": "high",
        "health_conditions": ["joint", "skin"],
        "breed_id": "dog-breed-001",
    }
    pet_feats = encode_pet_features(test_pet)
    print(f"Pet features: {pet_feats}")

    # Test food feature encoding
    test_food = foods[0]
    food_feats = encode_food_features(test_food)
    print(f"Food features ({test_food['name']}): {food_feats}")

    # Test CBF scoring
    top_foods = score_all_foods(test_pet, foods, breeds, top_k=6)
    print(f"\nTop 6 foods for Labrador (active, joint+skin issues):")
    for item in top_foods:
        print(f"  {item['food']['name']:45s}  score={item['score']:.1f}")

    # Test dataset building (requires LightFM)
    if LIGHTFM_AVAILABLE:
        dataset, mappings = build_lightfm_dataset(foods, interactions)
        train, test = build_interaction_matrix(dataset, interactions)
        item_feats = build_item_features(dataset, foods)

        print(f"\nLightFM dataset built:")
        print(f"  Users: {train.shape[0]}, Items: {train.shape[1]}")
        print(f"  Train interactions: {train.nnz}")
        print(f"  Test interactions:  {test.nnz}")
        print(f"  Item features shape: {item_feats.shape}")
    else:
        print("\n⚠ LightFM not available — skipping dataset build test.")
        print("  CBF baseline scoring works. LightFM pipeline will work on Linux/GCP.")
