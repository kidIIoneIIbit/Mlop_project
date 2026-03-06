import json
import os
import pytest


def _load_food_ids_by_species(species: str, n: int):
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "foods.json")

    with open(data_path, "r", encoding="utf-8") as f:
        foods = json.load(f)

    ids = []
    for x in foods:
        sp = x.get("species")

        if isinstance(sp, list):
            if species in sp:
                ids.append(x["id"])
        else:
            if sp == species:
                ids.append(x["id"])

    return ids[:n]


def test_compare_two_dog_foods(client, sample_dog_profile):

    dog_ids = _load_food_ids_by_species("dog", 2)

    if len(dog_ids) < 2:
        pytest.skip("Not enough dog foods")

    r = client.post(
        "/compare/",
        json={
            **sample_dog_profile,
            "food_ids": dog_ids
        },
    )

    assert r.status_code == 200

    data = r.json()

    assert isinstance(data["comparison"], list)
    assert len(data["comparison"]) == 2

    if data["comparison"]:
        assert data["winner"] is not None


def test_compare_three_cat_foods(client, sample_cat_profile):

    cat_ids = _load_food_ids_by_species("cat", 3)

    if len(cat_ids) < 3:
        pytest.skip("Not enough cat foods")

    r = client.post(
        "/compare/",
        json={
            **sample_cat_profile,
            "food_ids": cat_ids
        },
    )

    assert r.status_code == 200

    data = r.json()

    assert isinstance(data["comparison"], list)
    assert len(data["comparison"]) == 3

    if data["comparison"]:
        assert data["winner"] is not None


def test_compare_winner_highest(client, sample_dog_profile):

    dog_ids = _load_food_ids_by_species("dog", 2)

    if len(dog_ids) < 2:
        pytest.skip("Not enough dog foods")

    r = client.post(
        "/compare/",
        json={
            **sample_dog_profile,
            "food_ids": dog_ids
        },
    )

    assert r.status_code == 200

    data = r.json()

    scores = [x["score"] for x in data["comparison"]]

    if scores:
        assert data["winner"]["score"] == max(scores)


def test_compare_nonexistent_food(client, sample_dog_profile):

    r = client.post(
        "/compare/",
        json={
            **sample_dog_profile,
            "food_ids": ["fake_id"]
        },
    )

    assert r.status_code == 200

    data = r.json()

    assert data["comparison"] == []
    assert data["winner"] is None