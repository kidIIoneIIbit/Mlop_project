# backend/tests/test_match_logic.py
from services.match_logic import calculate_match_score, generate_match_reasons


def test_high_score(sample_food, sample_breed, sample_dog_profile):
    score = calculate_match_score(sample_food, sample_dog_profile, sample_breed)
    assert score >= 30


def test_low_score_no_overlap(sample_food, sample_breed):
    profile = {"health_conditions": ["heart"]}
    score = calculate_match_score(sample_food, profile, sample_breed)
    assert 10 <= score <= 99


def test_overweight_fat_control(sample_food, sample_breed, sample_dog_profile):
    breed = dict(sample_breed)
    breed["weight_tendency"] = "overweight"
    food = dict(sample_food)
    food["nutritional_content"] = dict(food["nutritional_content"])
    food["nutritional_content"]["fat_pct"] = 10  # <= fat_min
    score = calculate_match_score(food, sample_dog_profile, breed)
    assert 10 <= score <= 99


def test_score_clamped_10_to_99(sample_food, sample_breed, sample_dog_profile):
    food = dict(sample_food)
    food["avg_rating"] = 999  # ดันคะแนนให้สูงสุด
    score = calculate_match_score(food, sample_dog_profile, sample_breed)
    assert 10 <= score <= 99


# ---- reasons tests ----

def test_health_tag_match_reason(sample_food, sample_breed, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["health_conditions"] = ["joint"]
    reasons = generate_match_reasons(sample_food, profile, sample_breed)
    assert "Supports joint health" in reasons


def test_protein_adequate_reason(sample_food, sample_breed, sample_dog_profile):
    food = dict(sample_food)
    food["nutritional_content"] = dict(food["nutritional_content"])
    food["nutritional_content"]["protein_pct"] = 999  # >= protein_min แน่นอน
    reasons = generate_match_reasons(food, sample_dog_profile, sample_breed)
    assert "Meets protein requirement" in reasons


def test_overweight_low_fat_reason(sample_food, sample_breed, sample_dog_profile):
    breed = dict(sample_breed)
    breed["weight_tendency"] = "overweight"
    breed["nutritional_targets"] = dict(breed["nutritional_targets"])
    breed["nutritional_targets"]["fat_min"] = 12

    food = dict(sample_food)
    food["nutritional_content"] = dict(food["nutritional_content"])
    food["nutritional_content"]["fat_pct"] = 10  # <= fat_min

    reasons = generate_match_reasons(food, sample_dog_profile, breed)
    assert "Low fat suitable for weight control" in reasons


def test_high_rating_reason(sample_food, sample_breed, sample_dog_profile):
    food = dict(sample_food)
    food["avg_rating"] = 4.8

    breed = dict(sample_breed)
    breed["common_health_issues"] = []
    breed["weight_tendency"] = None

    profile = dict(sample_dog_profile)
    profile["health_conditions"] = []

    reasons = generate_match_reasons(food, profile, breed)
    assert "Highly rated by pet owners" in reasons


def test_max_3_reasons(sample_food, sample_breed, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["health_conditions"] = ["joint", "skin", "digestive", "kidney"]
    food = dict(sample_food)
    food["tags"] = ["joint", "skin", "digestive", "kidney"]
    food["avg_rating"] = 4.9
    reasons = generate_match_reasons(food, profile, sample_breed)
    assert len(reasons) <= 3