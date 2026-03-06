# backend/tests/test_compare.py
import json
import os
import pytest


def _load_food_ids_by_species(species: str, n: int):
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "foods.json")
    with open(data_path, "r", encoding="utf-8") as f:
        foods = json.load(f).get("foods", [])
    ids = [x["id"] for x in foods if species in x.get("species", [])]
    return ids[:n]


def test_compare_two_dog_foods(client, sample_dog_profile):
    preferred = ["purpose-brother-ago", "require-sit-wait"]
    dog_ids = _load_food_ids_by_species("dog", 2)

    # พยายามใช้ตามที่กำหนด ถ้าไม่มีจริง fallback เป็นของจริง
    food_ids = preferred
    if not all(pid in dog_ids for pid in preferred):
        if len(dog_ids) < 2:
            pytest.skip("Not enough dog foods in foods.json")
        food_ids = dog_ids

    r = client.post("/compare/", json={"food_ids": food_ids, "pet_profile": sample_dog_profile})
    assert r.status_code == 200
    data = r.json()

    assert isinstance(data["comparison"], list)
    assert len(data["comparison"]) == 2
    assert data["winner"] is not None


def test_compare_three_cat_foods(client, sample_cat_profile):
    preferred = ["executive-attorney", "individual-usually", "size-option-nothing"]
    cat_ids = _load_food_ids_by_species("cat", 3)

    food_ids = preferred
    if not all(pid in cat_ids for pid in preferred):
        if len(cat_ids) < 3:
            pytest.skip("Not enough cat foods in foods.json")
        food_ids = cat_ids

    r = client.post("/compare/", json={"food_ids": food_ids, "pet_profile": sample_cat_profile})
    assert r.status_code == 200
    data = r.json()

    assert isinstance(data["comparison"], list)
    assert len(data["comparison"]) == 3
    assert data["winner"] is not None


def test_compare_winner_highest(client, sample_dog_profile):
    dog_ids = _load_food_ids_by_species("dog", 2)
    if len(dog_ids) < 2:
        pytest.skip("Not enough dog foods in foods.json")

    r = client.post("/compare/", json={"food_ids": dog_ids, "pet_profile": sample_dog_profile})
    assert r.status_code == 200
    data = r.json()

    scores = [x["match_score"] for x in data["comparison"]]
    assert data["winner"]["match_score"] == max(scores)


def test_compare_nonexistent_food(client, sample_dog_profile):
    r = client.post("/compare/", json={"food_ids": ["fake_id"], "pet_profile": sample_dog_profile})
    assert r.status_code == 200
    data = r.json()
    assert data["comparison"] == []
    assert data["winner"] is None