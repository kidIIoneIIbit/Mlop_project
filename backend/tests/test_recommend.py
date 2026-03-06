# backend/tests/test_recommend.py

def _assert_recommend_item_shape(item: dict):
    assert "food_id" in item
    assert "food_name" in item
    assert "match_score" in item
    assert "match_reasons" in item
    assert "nutrition_gap_analysis" in item


def test_recommend_labrador(client, sample_dog_profile):
    r = client.post("/recommendations/", json=sample_dog_profile)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["recommendations"], list)
    for it in data["recommendations"]:
        _assert_recommend_item_shape(it)


def test_recommend_golden_retriever(client, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["breed_id"] = "golden_retriever"
    profile["health_conditions"] = ["skin", "digestive"]
    r = client.post("/recommendations/", json=profile)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["recommendations"], list)
    for it in data["recommendations"]:
        _assert_recommend_item_shape(it)


def test_recommend_persian(client, sample_cat_profile):
    r = client.post("/recommendations/", json=sample_cat_profile)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["recommendations"], list)
    for it in data["recommendations"]:
        _assert_recommend_item_shape(it)


def test_recommend_invalid_breed(client, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["breed_id"] = "nonexistent"
    r = client.post("/recommendations/", json=profile)
    assert r.status_code == 200
    data = r.json()
    assert data["recommendations"] == []


def test_recommend_top_k(client, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["top_k"] = 2
    r = client.post("/recommendations/", json=profile)
    assert r.status_code == 200
    data = r.json()
    assert len(data["recommendations"]) <= 2


def test_recommend_response_structure(client, sample_dog_profile):
    r = client.post("/recommendations/", json=sample_dog_profile)
    assert r.status_code == 200
    data = r.json()

    assert "pet_profile" in data
    assert "recommendations" in data
    assert "model_used" in data
    assert "model_version" in data
    assert "generated_at" in data