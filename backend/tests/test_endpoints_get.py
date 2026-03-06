# backend/tests/test_endpoints_get.py
import json
import os
import pytest


def _load_any_food_id():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "foods.json")
    with open(data_path, "r", encoding="utf-8") as f:
        foods = json.load(f).get("foods", [])
    return foods[0]["id"] if foods else None


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["version"] == "1.0.0"


def test_model_info(client):
    r = client.get("/model/info")
    assert r.status_code == 200
    body = r.json()
    assert "model_name" in body
    assert "version" in body
    assert "precision_at_5" in body


def test_breeds_dog(client):
    r = client.get("/breeds/dog")
    assert r.status_code == 200
    breeds = r.json()["breeds"]
    assert isinstance(breeds, list)
    assert all(b["species"] == "dog" for b in breeds)


def test_breeds_cat(client):
    r = client.get("/breeds/cat")
    assert r.status_code == 200
    breeds = r.json()["breeds"]
    assert isinstance(breeds, list)
    assert all(b["species"] == "cat" for b in breeds)


def test_breed_detail(client):
    r = client.get("/breeds/dog/labrador_retriever")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "labrador_retriever"


def test_breed_not_found(client):
    r = client.get("/breeds/dog/nonexistent")
    assert r.status_code == 404


def test_foods_list(client):
    r = client.get("/foods")
    assert r.status_code == 200
    foods = r.json()["foods"]
    assert isinstance(foods, list)
    assert len(foods) > 0


def test_foods_filter_species(client):
    r = client.get("/foods?species=cat")
    assert r.status_code == 200
    foods = r.json()["foods"]
    assert all("cat" in f["species"] for f in foods)


def test_foods_filter_type(client):
    r = client.get("/foods?food_type=dry")
    assert r.status_code == 200
    foods = r.json()["foods"]
    assert all(f["food_type"] == "dry" for f in foods)


def test_foods_filter_tag(client):
    r = client.get("/foods?tag=joint")
    assert r.status_code == 200
    foods = r.json()["foods"]
    assert all("joint" in f["tags"] for f in foods)


def test_food_detail(client):
    fid = _load_any_food_id()
    if not fid:
        pytest.skip("No foods in foods.json")
    r = client.get(f"/foods/{fid}")
    assert r.status_code == 200
    assert r.json()["id"] == fid


def test_food_not_found(client):
    r = client.get("/foods/nonexistent")
    assert r.status_code == 200
    assert "error" in r.json()