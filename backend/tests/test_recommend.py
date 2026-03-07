def _assert_recommend_item_shape(item: dict):
    assert "food_id" in item
    assert "name" in item
    assert "brand" in item
    assert "score" in item


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

    r = client.post("/recommendations/", json=profile)
    assert r.status_code == 200

    data = r.json()

    for it in data["recommendations"]:
        _assert_recommend_item_shape(it)


def test_recommend_persian(client, sample_cat_profile):
    r = client.post("/recommendations/", json=sample_cat_profile)
    assert r.status_code == 200

    data = r.json()

    for it in data["recommendations"]:
        _assert_recommend_item_shape(it)


def test_recommend_invalid_breed(client, sample_dog_profile):
    profile = dict(sample_dog_profile)
    profile["breed_id"] = "nonexistent"

    r = client.post("/recommendations/", json=profile)
    assert r.status_code == 200

    data = r.json()
    assert isinstance(data["recommendations"], list)