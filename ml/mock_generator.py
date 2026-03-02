"""
Mock Data Generator for Pet Lifestyle & Nutrition Recommender
=============================================================
Person C — ML / Data  |  Day 1–2 Deliverable

Generates deterministic mock data using Faker with SEED=42:
  - breeds.json   (11 dog + 10 cat breeds)
  - foods.json    (12 dog + 12 cat products)
  - interactions.json (200 users × 5–15 ratings each)

Usage:
    python mock_generator.py [--output-dir ../backend/data]
"""

import json
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from faker import Faker

# ── Reproducibility ──────────────────────────────────────────────────────────
SEED = 42
random.seed(SEED)
fake = Faker()
Faker.seed(SEED)

# ── Output directory (default: ../backend/data) ─────────────────────────────
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"


# ════════════════════════════════════════════════════════════════════════════
#  BREED DATA
# ════════════════════════════════════════════════════════════════════════════

DOG_BREEDS_RAW: list[dict[str, Any]] = [
    {
        "name": "Labrador Retriever",
        "size": "large",
        "weight_range_kg": [25, 36],
        "life_expectancy_years": [10, 14],
        "weight_tendency": "overweight",
        "common_health_issues": ["hip dysplasia", "obesity", "ear infections"],
        "nutritional_targets": {
            "protein_min": 22,
            "fat_min": 8,
            "fiber_min": 3,
            "calorie_range": [1500, 2000],
        },
    },
    {
        "name": "German Shepherd",
        "size": "large",
        "weight_range_kg": [22, 40],
        "life_expectancy_years": [9, 13],
        "weight_tendency": "normal",
        "common_health_issues": ["hip dysplasia", "degenerative myelopathy", "bloat"],
        "nutritional_targets": {
            "protein_min": 24,
            "fat_min": 10,
            "fiber_min": 3,
            "calorie_range": [1700, 2200],
        },
    },
    {
        "name": "Golden Retriever",
        "size": "large",
        "weight_range_kg": [25, 34],
        "life_expectancy_years": [10, 12],
        "weight_tendency": "overweight",
        "common_health_issues": ["hip dysplasia", "cancer", "skin allergies"],
        "nutritional_targets": {
            "protein_min": 22,
            "fat_min": 8,
            "fiber_min": 3,
            "calorie_range": [1400, 1900],
        },
    },
    {
        "name": "French Bulldog",
        "size": "small",
        "weight_range_kg": [8, 14],
        "life_expectancy_years": [10, 14],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "brachycephalic syndrome",
            "skin fold dermatitis",
            "joint issues",
        ],
        "nutritional_targets": {
            "protein_min": 24,
            "fat_min": 10,
            "fiber_min": 4,
            "calorie_range": [500, 800],
        },
    },
    {
        "name": "Beagle",
        "size": "medium",
        "weight_range_kg": [9, 16],
        "life_expectancy_years": [12, 15],
        "weight_tendency": "overweight",
        "common_health_issues": ["obesity", "epilepsy", "ear infections"],
        "nutritional_targets": {
            "protein_min": 22,
            "fat_min": 8,
            "fiber_min": 4,
            "calorie_range": [600, 1000],
        },
    },
    {
        "name": "Poodle",
        "size": "medium",
        "weight_range_kg": [18, 32],
        "life_expectancy_years": [12, 15],
        "weight_tendency": "normal",
        "common_health_issues": [
            "hip dysplasia",
            "progressive retinal atrophy",
            "bloat",
        ],
        "nutritional_targets": {
            "protein_min": 24,
            "fat_min": 10,
            "fiber_min": 3,
            "calorie_range": [1000, 1500],
        },
    },
    {
        "name": "Bulldog",
        "size": "medium",
        "weight_range_kg": [18, 25],
        "life_expectancy_years": [8, 10],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "brachycephalic syndrome",
            "skin fold dermatitis",
            "joint issues",
        ],
        "nutritional_targets": {
            "protein_min": 22,
            "fat_min": 8,
            "fiber_min": 4,
            "calorie_range": [1000, 1500],
        },
    },
    {
        "name": "Rottweiler",
        "size": "large",
        "weight_range_kg": [36, 60],
        "life_expectancy_years": [8, 11],
        "weight_tendency": "normal",
        "common_health_issues": ["hip dysplasia", "heart disease", "cancer"],
        "nutritional_targets": {
            "protein_min": 26,
            "fat_min": 12,
            "fiber_min": 3,
            "calorie_range": [2000, 2800],
        },
    },
    {
        "name": "Yorkshire Terrier",
        "size": "small",
        "weight_range_kg": [2, 4],
        "life_expectancy_years": [12, 16],
        "weight_tendency": "normal",
        "common_health_issues": [
            "dental disease",
            "collapsed trachea",
            "luxating patella",
        ],
        "nutritional_targets": {
            "protein_min": 26,
            "fat_min": 12,
            "fiber_min": 3,
            "calorie_range": [150, 300],
        },
    },
    {
        "name": "Dachshund",
        "size": "small",
        "weight_range_kg": [5, 15],
        "life_expectancy_years": [12, 16],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "intervertebral disc disease",
            "obesity",
            "dental disease",
        ],
        "nutritional_targets": {
            "protein_min": 22,
            "fat_min": 8,
            "fiber_min": 4,
            "calorie_range": [400, 700],
        },
    },
    {
        "name": "Siberian Husky",
        "size": "large",
        "weight_range_kg": [16, 27],
        "life_expectancy_years": [12, 15],
        "weight_tendency": "normal",
        "common_health_issues": ["hip dysplasia", "eye disorders", "zinc deficiency"],
        "nutritional_targets": {
            "protein_min": 26,
            "fat_min": 14,
            "fiber_min": 3,
            "calorie_range": [1200, 1800],
        },
    },
]

CAT_BREEDS_RAW: list[dict[str, Any]] = [
    {
        "name": "Persian",
        "size": "medium",
        "weight_range_kg": [3, 6],
        "life_expectancy_years": [12, 17],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "polycystic kidney disease",
            "eye discharge",
            "dental disease",
        ],
        "nutritional_targets": {
            "protein_min": 30,
            "fat_min": 9,
            "fiber_min": 3,
            "calorie_range": [200, 350],
        },
    },
    {
        "name": "Maine Coon",
        "size": "large",
        "weight_range_kg": [5, 11],
        "life_expectancy_years": [10, 13],
        "weight_tendency": "normal",
        "common_health_issues": [
            "hypertrophic cardiomyopathy",
            "hip dysplasia",
            "spinal muscular atrophy",
        ],
        "nutritional_targets": {
            "protein_min": 32,
            "fat_min": 10,
            "fiber_min": 3,
            "calorie_range": [300, 500],
        },
    },
    {
        "name": "Siamese",
        "size": "medium",
        "weight_range_kg": [3, 5],
        "life_expectancy_years": [12, 20],
        "weight_tendency": "normal",
        "common_health_issues": ["amyloidosis", "asthma", "dental disease"],
        "nutritional_targets": {
            "protein_min": 32,
            "fat_min": 9,
            "fiber_min": 2,
            "calorie_range": [200, 350],
        },
    },
    {
        "name": "Ragdoll",
        "size": "large",
        "weight_range_kg": [4, 9],
        "life_expectancy_years": [12, 17],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "hypertrophic cardiomyopathy",
            "urinary tract issues",
            "hairballs",
        ],
        "nutritional_targets": {
            "protein_min": 30,
            "fat_min": 10,
            "fiber_min": 3,
            "calorie_range": [250, 400],
        },
    },
    {
        "name": "Bengal",
        "size": "medium",
        "weight_range_kg": [4, 7],
        "life_expectancy_years": [12, 16],
        "weight_tendency": "normal",
        "common_health_issues": [
            "hypertrophic cardiomyopathy",
            "progressive retinal atrophy",
            "patellar luxation",
        ],
        "nutritional_targets": {
            "protein_min": 34,
            "fat_min": 12,
            "fiber_min": 2,
            "calorie_range": [250, 400],
        },
    },
    {
        "name": "British Shorthair",
        "size": "medium",
        "weight_range_kg": [4, 8],
        "life_expectancy_years": [12, 17],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "hypertrophic cardiomyopathy",
            "obesity",
            "dental disease",
        ],
        "nutritional_targets": {
            "protein_min": 30,
            "fat_min": 9,
            "fiber_min": 4,
            "calorie_range": [200, 350],
        },
    },
    {
        "name": "Sphynx",
        "size": "medium",
        "weight_range_kg": [3, 5],
        "life_expectancy_years": [8, 14],
        "weight_tendency": "normal",
        "common_health_issues": [
            "hypertrophic cardiomyopathy",
            "skin conditions",
            "respiratory issues",
        ],
        "nutritional_targets": {
            "protein_min": 35,
            "fat_min": 14,
            "fiber_min": 2,
            "calorie_range": [300, 500],
        },
    },
    {
        "name": "Abyssinian",
        "size": "medium",
        "weight_range_kg": [3, 5],
        "life_expectancy_years": [12, 15],
        "weight_tendency": "normal",
        "common_health_issues": [
            "renal amyloidosis",
            "progressive retinal atrophy",
            "gingivitis",
        ],
        "nutritional_targets": {
            "protein_min": 34,
            "fat_min": 12,
            "fiber_min": 2,
            "calorie_range": [250, 350],
        },
    },
    {
        "name": "Scottish Fold",
        "size": "medium",
        "weight_range_kg": [3, 6],
        "life_expectancy_years": [11, 15],
        "weight_tendency": "overweight",
        "common_health_issues": [
            "osteochondrodysplasia",
            "polycystic kidney disease",
            "cardiomyopathy",
        ],
        "nutritional_targets": {
            "protein_min": 30,
            "fat_min": 9,
            "fiber_min": 3,
            "calorie_range": [200, 350],
        },
    },
    {
        "name": "Russian Blue",
        "size": "medium",
        "weight_range_kg": [3, 7],
        "life_expectancy_years": [15, 20],
        "weight_tendency": "overweight",
        "common_health_issues": ["obesity", "urinary tract issues", "bladder stones"],
        "nutritional_targets": {
            "protein_min": 30,
            "fat_min": 9,
            "fiber_min": 4,
            "calorie_range": [200, 350],
        },
    },
]


# ════════════════════════════════════════════════════════════════════════════
#  FOOD DATA
# ════════════════════════════════════════════════════════════════════════════

DOG_FOOD_TEMPLATES: list[dict[str, Any]] = [
    {
        "name": "Premium Chicken & Rice Formula",
        "brand": "NutraPaws",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 28,
            "fat": 16,
            "fiber": 4,
            "kcal_per_100g": 365,
        },
        "tags": ["high-protein", "joint-support"],
        "certifications": ["AAFCO"],
        "badges": ["vet-recommended"],
    },
    {
        "name": "Grain-Free Salmon & Sweet Potato",
        "brand": "WildTail",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 30,
            "fat": 14,
            "fiber": 5,
            "kcal_per_100g": 350,
        },
        "tags": ["grain-free", "omega-rich", "skin-health"],
        "certifications": ["AAFCO", "Non-GMO"],
        "badges": ["allergy-friendly"],
    },
    {
        "name": "Weight Management Turkey Formula",
        "brand": "LeanBites",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 26,
            "fat": 8,
            "fiber": 8,
            "kcal_per_100g": 300,
        },
        "tags": ["weight-management", "high-fiber"],
        "certifications": ["AAFCO"],
        "badges": ["weight-control"],
    },
    {
        "name": "Puppy Growth Chicken Formula",
        "brand": "NutraPaws",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 32,
            "fat": 18,
            "fiber": 3,
            "kcal_per_100g": 390,
        },
        "tags": ["puppy", "high-protein", "growth-support"],
        "certifications": ["AAFCO"],
        "badges": ["life-stage-puppy"],
    },
    {
        "name": "Senior Vitality Lamb & Oats",
        "brand": "GoldenYears",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 22,
            "fat": 10,
            "fiber": 6,
            "kcal_per_100g": 320,
        },
        "tags": ["senior", "joint-support", "easy-digest"],
        "certifications": ["AAFCO"],
        "badges": ["life-stage-senior"],
    },
    {
        "name": "Organic Free-Range Beef Stew",
        "brand": "FreshPot",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 10,
            "fat": 6,
            "fiber": 1,
            "kcal_per_100g": 110,
        },
        "tags": ["organic", "grain-free"],
        "certifications": ["AAFCO", "USDA Organic"],
        "badges": ["premium"],
    },
    {
        "name": "Chicken & Vegetable Medley",
        "brand": "FreshPot",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 9,
            "fat": 5,
            "fiber": 2,
            "kcal_per_100g": 95,
        },
        "tags": ["balanced", "easy-digest"],
        "certifications": ["AAFCO"],
        "badges": [],
    },
    {
        "name": "Salmon Pâté for Sensitive Stomachs",
        "brand": "GentleMeals",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 11,
            "fat": 7,
            "fiber": 1,
            "kcal_per_100g": 120,
        },
        "tags": ["sensitive-stomach", "omega-rich", "skin-health"],
        "certifications": ["AAFCO"],
        "badges": ["digestive-care"],
    },
    {
        "name": "Raw Freeze-Dried Venison Bites",
        "brand": "PrimalPaws",
        "food_type": "raw",
        "nutritional_content": {
            "protein": 42,
            "fat": 22,
            "fiber": 2,
            "kcal_per_100g": 420,
        },
        "tags": ["high-protein", "grain-free", "raw-diet"],
        "certifications": ["AAFCO"],
        "badges": ["premium", "raw"],
    },
    {
        "name": "Budget Chicken & Corn Kibble",
        "brand": "EverydayPet",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 20,
            "fat": 9,
            "fiber": 5,
            "kcal_per_100g": 330,
        },
        "tags": ["budget-friendly"],
        "certifications": ["AAFCO"],
        "badges": [],
    },
    {
        "name": "Hip & Joint Support Duck Formula",
        "brand": "VetSelect",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 27,
            "fat": 12,
            "fiber": 4,
            "kcal_per_100g": 355,
        },
        "tags": ["joint-support", "glucosamine", "senior"],
        "certifications": ["AAFCO"],
        "badges": ["vet-recommended", "joint-care"],
    },
    {
        "name": "Hydrolyzed Protein Veterinary Diet",
        "brand": "VetSelect",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 24,
            "fat": 11,
            "fiber": 5,
            "kcal_per_100g": 340,
        },
        "tags": ["hypoallergenic", "sensitive-stomach", "veterinary"],
        "certifications": ["AAFCO"],
        "badges": ["vet-recommended", "allergy-friendly"],
    },
]

CAT_FOOD_TEMPLATES: list[dict[str, Any]] = [
    {
        "name": "Indoor Cat Chicken Recipe",
        "brand": "FelineFit",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 36,
            "fat": 12,
            "fiber": 6,
            "kcal_per_100g": 350,
        },
        "tags": ["indoor", "hairball-control", "weight-management"],
        "certifications": ["AAFCO"],
        "badges": ["indoor-formula"],
    },
    {
        "name": "Grain-Free Ocean Fish Feast",
        "brand": "WildWhiskers",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 12,
            "fat": 5,
            "fiber": 1,
            "kcal_per_100g": 95,
        },
        "tags": ["grain-free", "omega-rich", "skin-health"],
        "certifications": ["AAFCO", "Non-GMO"],
        "badges": ["allergy-friendly"],
    },
    {
        "name": "High-Protein Turkey & Liver Pâté",
        "brand": "WildWhiskers",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 14,
            "fat": 8,
            "fiber": 1,
            "kcal_per_100g": 120,
        },
        "tags": ["high-protein", "grain-free"],
        "certifications": ["AAFCO"],
        "badges": ["premium"],
    },
    {
        "name": "Kitten Growth Chicken Formula",
        "brand": "FelineFit",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 40,
            "fat": 18,
            "fiber": 3,
            "kcal_per_100g": 400,
        },
        "tags": ["kitten", "high-protein", "growth-support"],
        "certifications": ["AAFCO"],
        "badges": ["life-stage-kitten"],
    },
    {
        "name": "Senior Cat Gentle Care",
        "brand": "GoldenPurr",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 32,
            "fat": 10,
            "fiber": 5,
            "kcal_per_100g": 330,
        },
        "tags": ["senior", "kidney-support", "easy-digest"],
        "certifications": ["AAFCO"],
        "badges": ["life-stage-senior", "kidney-care"],
    },
    {
        "name": "Urinary Health Chicken Recipe",
        "brand": "VetPurr",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 34,
            "fat": 11,
            "fiber": 4,
            "kcal_per_100g": 345,
        },
        "tags": ["urinary-health", "veterinary"],
        "certifications": ["AAFCO"],
        "badges": ["vet-recommended", "urinary-care"],
    },
    {
        "name": "Weight Control Indoor Formula",
        "brand": "LeanPurr",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 38,
            "fat": 8,
            "fiber": 8,
            "kcal_per_100g": 310,
        },
        "tags": ["weight-management", "indoor", "high-fiber"],
        "certifications": ["AAFCO"],
        "badges": ["weight-control", "indoor-formula"],
    },
    {
        "name": "Salmon & Shrimp Medley",
        "brand": "OceanBites",
        "food_type": "wet",
        "nutritional_content": {
            "protein": 11,
            "fat": 6,
            "fiber": 1,
            "kcal_per_100g": 100,
        },
        "tags": ["omega-rich", "skin-health"],
        "certifications": ["AAFCO"],
        "badges": [],
    },
    {
        "name": "Raw Freeze-Dried Rabbit Bites",
        "brand": "PrimalCat",
        "food_type": "raw",
        "nutritional_content": {
            "protein": 45,
            "fat": 20,
            "fiber": 2,
            "kcal_per_100g": 430,
        },
        "tags": ["high-protein", "grain-free", "raw-diet"],
        "certifications": ["AAFCO"],
        "badges": ["premium", "raw"],
    },
    {
        "name": "Budget Chicken & Rice Kibble",
        "brand": "EverydayPet",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 30,
            "fat": 10,
            "fiber": 5,
            "kcal_per_100g": 340,
        },
        "tags": ["budget-friendly"],
        "certifications": ["AAFCO"],
        "badges": [],
    },
    {
        "name": "Sensitive Skin & Stomach Salmon",
        "brand": "GentlePurr",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 33,
            "fat": 14,
            "fiber": 3,
            "kcal_per_100g": 360,
        },
        "tags": ["sensitive-stomach", "skin-health", "omega-rich"],
        "certifications": ["AAFCO"],
        "badges": ["digestive-care", "allergy-friendly"],
    },
    {
        "name": "Sphynx High-Calorie Formula",
        "brand": "FelineFit",
        "food_type": "dry",
        "nutritional_content": {
            "protein": 42,
            "fat": 18,
            "fiber": 2,
            "kcal_per_100g": 410,
        },
        "tags": ["high-calorie", "high-protein", "skin-health"],
        "certifications": ["AAFCO"],
        "badges": ["breed-specific", "premium"],
    },
]


# ════════════════════════════════════════════════════════════════════════════
#  GENERATORS
# ════════════════════════════════════════════════════════════════════════════


def generate_breeds() -> list[dict[str, Any]]:
    """Generate 11 dog breeds + 10 cat breeds with full schema."""
    breeds: list[dict[str, Any]] = []

    for idx, raw in enumerate(DOG_BREEDS_RAW, start=1):
        breeds.append(
            {
                "id": f"dog-breed-{idx:03d}",
                "name": raw["name"],
                "species": "dog",
                "size": raw["size"],
                "weight_range_kg": raw["weight_range_kg"],
                "life_expectancy_years": raw["life_expectancy_years"],
                "weight_tendency": raw["weight_tendency"],
                "common_health_issues": raw["common_health_issues"],
                "nutritional_targets": raw["nutritional_targets"],
            }
        )

    for idx, raw in enumerate(CAT_BREEDS_RAW, start=1):
        breeds.append(
            {
                "id": f"cat-breed-{idx:03d}",
                "name": raw["name"],
                "species": "cat",
                "size": raw["size"],
                "weight_range_kg": raw["weight_range_kg"],
                "life_expectancy_years": raw["life_expectancy_years"],
                "weight_tendency": raw["weight_tendency"],
                "common_health_issues": raw["common_health_issues"],
                "nutritional_targets": raw["nutritional_targets"],
            }
        )

    return breeds


def generate_foods() -> list[dict[str, Any]]:
    """Generate 24 food products (12 dog, 12 cat) with full schema."""
    foods: list[dict[str, Any]] = []

    for idx, tpl in enumerate(DOG_FOOD_TEMPLATES, start=1):
        foods.append(
            {
                "id": f"dog-food-{idx:03d}",
                "name": tpl["name"],
                "brand": tpl["brand"],
                "species": "dog",
                "food_type": tpl["food_type"],
                "nutritional_content": tpl["nutritional_content"],
                "tags": tpl["tags"],
                "certifications": tpl["certifications"],
                "badges": tpl["badges"],
                "price_usd": round(random.uniform(15.0, 75.0), 2),
                "avg_rating": round(random.uniform(3.5, 5.0), 1),
            }
        )

    for idx, tpl in enumerate(CAT_FOOD_TEMPLATES, start=1):
        foods.append(
            {
                "id": f"cat-food-{idx:03d}",
                "name": tpl["name"],
                "brand": tpl["brand"],
                "species": "cat",
                "food_type": tpl["food_type"],
                "nutritional_content": tpl["nutritional_content"],
                "tags": tpl["tags"],
                "certifications": tpl["certifications"],
                "badges": tpl["badges"],
                "price_usd": round(random.uniform(10.0, 60.0), 2),
                "avg_rating": round(random.uniform(3.5, 5.0), 1),
            }
        )

    return foods


def generate_interactions(
    breeds: list[dict], foods: list[dict], n_users: int = 200
) -> list[dict[str, Any]]:
    """
    Generate mock user-item interactions.
    Each user is randomly assigned a species preference, then rates
    5–15 species-appropriate foods on a 1–5 scale.
    """
    dog_food_ids = [f["id"] for f in foods if f["species"] == "dog"]
    cat_food_ids = [f["id"] for f in foods if f["species"] == "cat"]

    base_date = datetime(2025, 1, 1)
    interactions: list[dict[str, Any]] = []

    for user_idx in range(1, n_users + 1):
        user_id = f"user-{user_idx:04d}"
        species = random.choice(["dog", "cat"])
        pool = dog_food_ids if species == "dog" else cat_food_ids

        n_ratings = random.randint(5, min(15, len(pool)))
        rated_foods = random.sample(pool, n_ratings)

        for food_id in rated_foods:
            # Slightly skew ratings higher for realistic distribution
            rating = min(5, max(1, round(random.gauss(3.8, 1.0))))
            timestamp = (base_date + timedelta(days=random.randint(0, 365))).isoformat()

            interactions.append(
                {
                    "user_id": user_id,
                    "item_id": food_id,
                    "rating": rating,
                    "timestamp": timestamp,
                }
            )

    return interactions


# ════════════════════════════════════════════════════════════════════════════
#  VALIDATION
# ════════════════════════════════════════════════════════════════════════════


def validate_data(
    breeds: list[dict], foods: list[dict], interactions: list[dict]
) -> None:
    """Comprehensive validation — raises AssertionError on any failure."""

    # ── Breeds ───────────────────────────────────────────────────────────
    assert (
        len([b for b in breeds if b["species"] == "dog"]) == 11
    ), "Expected 11 dog breeds"
    assert (
        len([b for b in breeds if b["species"] == "cat"]) == 10
    ), "Expected 10 cat breeds"

    breed_ids = {b["id"] for b in breeds}
    for b in breeds:
        assert b["id"], "Breed missing id"
        assert b["name"], "Breed missing name"
        assert b["species"] in ("dog", "cat"), f"Invalid species: {b['species']}"
        assert b["size"] in ("small", "medium", "large"), f"Invalid size: {b['size']}"
        assert len(b["weight_range_kg"]) == 2, "weight_range_kg must be [min, max]"
        assert (
            b["weight_range_kg"][0] < b["weight_range_kg"][1]
        ), "weight range min >= max"

        nt = b["nutritional_targets"]
        assert (
            18 <= nt["protein_min"] <= 45
        ), f"Unrealistic protein_min: {nt['protein_min']}"
        assert 5 <= nt["fat_min"] <= 25, f"Unrealistic fat_min: {nt['fat_min']}"
        assert 1 <= nt["fiber_min"] <= 10, f"Unrealistic fiber_min: {nt['fiber_min']}"
        assert len(nt["calorie_range"]) == 2, "calorie_range must be [min, max]"

    # ── Foods ────────────────────────────────────────────────────────────
    assert (
        len([f for f in foods if f["species"] == "dog"]) == 12
    ), "Expected 12 dog foods"
    assert (
        len([f for f in foods if f["species"] == "cat"]) == 12
    ), "Expected 12 cat foods"

    food_ids = {f["id"] for f in foods}
    for f in foods:
        assert f["id"], "Food missing id"
        assert f["name"], "Food missing name"
        assert f["brand"], "Food missing brand"
        assert f["species"] in ("dog", "cat"), f"Invalid species: {f['species']}"
        assert f["food_type"] in (
            "dry",
            "wet",
            "raw",
        ), f"Invalid food_type: {f['food_type']}"
        assert f["price_usd"] > 0, "Price must be positive"
        assert 1.0 <= f["avg_rating"] <= 5.0, f"Rating out of range: {f['avg_rating']}"

        nc = f["nutritional_content"]
        assert (
            "protein" in nc and "fat" in nc and "fiber" in nc and "kcal_per_100g" in nc
        )

    # ── Interactions ─────────────────────────────────────────────────────
    assert len(interactions) > 0, "No interactions generated"
    user_ids = {i["user_id"] for i in interactions}
    assert len(user_ids) == 200, f"Expected 200 unique users, got {len(user_ids)}"

    for i in interactions:
        assert i["item_id"] in food_ids, f"Unknown food in interaction: {i['item_id']}"
        assert 1 <= i["rating"] <= 5, f"Rating out of range: {i['rating']}"
        assert i["timestamp"], "Interaction missing timestamp"

    print(f"✅ Validation passed:")
    print(f"   Breeds: {len(breeds)}  (11 dog + 10 cat)")
    print(f"   Foods:  {len(foods)}  (12 dog + 12 cat)")
    print(f"   Users:  {len(user_ids)}")
    print(f"   Interactions: {len(interactions)}")


# ════════════════════════════════════════════════════════════════════════════
#  MAIN
# ════════════════════════════════════════════════════════════════════════════


def main(output_dir: Path | None = None) -> None:
    out = output_dir or DEFAULT_OUTPUT_DIR
    out.mkdir(parents=True, exist_ok=True)

    print("🔄 Generating mock data (SEED=42) …")

    breeds = generate_breeds()
    foods = generate_foods()
    interactions = generate_interactions(breeds, foods, n_users=200)

    print("🔍 Validating data …")
    validate_data(breeds, foods, interactions)

    # Write JSON files
    for filename, data in [
        ("breeds.json", breeds),
        ("foods.json", foods),
        ("interactions.json", interactions),
    ]:
        path = out / filename
        with open(path, "w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2, ensure_ascii=False)
        print(f"📁 Written: {path}")

    print("✅ Mock data generation complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate mock data for Pet Nutrition Recommender"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory for JSON files (default: ../backend/data)",
    )
    args = parser.parse_args()
    main(args.output_dir)
