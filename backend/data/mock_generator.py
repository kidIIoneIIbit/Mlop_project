import json
import os
import random
from faker import Faker

SEED = 42
random.seed(SEED)
fake = Faker()
Faker.seed(SEED)

BASE_PATH = os.path.dirname(__file__)


# -----------------------
# BREED DATA GENERATION
# -----------------------

DOG_BREEDS = [
    "Labrador Retriever", "German Shepherd", "Golden Retriever",
    "Bulldog", "Poodle", "Beagle", "Shih Tzu",
    "Chihuahua", "Siberian Husky", "Dachshund", "Mixed Breed"
]

CAT_BREEDS = [
    "Persian", "Maine Coon", "Siamese", "Bengal",
    "Ragdoll", "Scottish Fold", "British Shorthair",
    "Sphynx", "Russian Blue", "Mixed Breed"
]

HEALTH_ISSUES = [
    "joint", "obesity", "skin", "digestive",
    "dental", "kidney", "hairball", "heart", "allergy"
]

SIZES = ["small", "medium", "large"]


def generate_breed(name, species):
    size = random.choice(SIZES)

    weight_range = (
        random.randint(3, 10) if size == "small" else
        random.randint(10, 25) if size == "medium" else
        random.randint(25, 45)
    )

    life_expectancy = random.randint(10, 16)

    weight_tendency = random.choice(["lean", "moderate", "overweight"])

    protein_min = random.randint(22, 32)
    fat_min = random.randint(10, 18)
    fiber_min = random.randint(3, 6)

    calorie_low = random.randint(150, 800)
    calorie_high = calorie_low + random.randint(200, 600)

    return {
        "id": name.lower().replace(" ", "_"),
        "name": name,
        "species": species,
        "size": size,
        "weight_range_kg": [weight_range - 3, weight_range + 3],
        "life_expectancy_years": [life_expectancy - 2, life_expectancy],
        "weight_tendency": weight_tendency,
        "common_health_issues": random.sample(HEALTH_ISSUES, k=3),
        "nutritional_targets": {
            "protein_min": protein_min,
            "fat_min": fat_min,
            "fiber_min": fiber_min,
            "calorie_range": [calorie_low, calorie_high]
        }
    }


def generate_breeds():
    breeds = []

    for name in DOG_BREEDS:
        breeds.append(generate_breed(name, "dog"))

    for name in CAT_BREEDS:
        breeds.append(generate_breed(name, "cat"))

    return {"breeds": breeds}


# -----------------------
# FOOD DATA GENERATION
# -----------------------

FOOD_TYPES = ["dry", "wet", "raw"]
FOOD_TAGS = [
    "joint", "skin", "digestive", "kidney",
    "hairball", "omega3", "grain-free", "large-breed"
]

CERTIFICATIONS = ["AAFCO", "Organic Certified", "Grain-Free Certified"]
BADGES = ["Vet Approved", "Best Seller", "Joint Support", "Premium"]


def generate_food(species):
    protein = random.randint(22, 38)
    fat = random.randint(8, 20)
    fiber = random.randint(2, 8)

    return {
        "id": fake.unique.slug(),
        "name": f"{fake.word().capitalize()} {fake.word().capitalize()} Formula",
        "brand": fake.company(),
        "species": [species],
        "food_type": random.choice(FOOD_TYPES),
        "nutritional_content": {
            "protein_pct": protein,
            "fat_pct": fat,
            "fiber_pct": fiber,
            "calories_per_100g": random.randint(300, 450)
        },
        "tags": random.sample(FOOD_TAGS, k=3),
        "certifications": random.sample(CERTIFICATIONS, k=1),
        "badges": random.sample(BADGES, k=2),
        "price_usd": round(random.uniform(20, 90), 2),
        "avg_rating": round(random.uniform(3.8, 5.0), 1)
    }


def generate_foods():
    foods = []

    for _ in range(12):
        foods.append(generate_food("dog"))

    for _ in range(12):
        foods.append(generate_food("cat"))

    return {"foods": foods}


# -----------------------
# MAIN GENERATOR
# -----------------------

def main():
    breeds_data = generate_breeds()
    foods_data = generate_foods()

    with open(os.path.join(BASE_PATH, "breeds.json"), "w", encoding="utf-8") as f:
        json.dump(breeds_data, f, indent=2)

    with open(os.path.join(BASE_PATH, "foods.json"), "w", encoding="utf-8") as f:
        json.dump(foods_data, f, indent=2)

    print("Mock data generated successfully with SEED=42")


if __name__ == "__main__":
    main()