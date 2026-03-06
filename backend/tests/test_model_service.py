from services.model_service import ModelService


def test_model_service_initialization():
    """
    ModelService should initialize without crashing.
    """
    service = ModelService()
    assert service is not None


def test_get_model_info_returns_dict():
    """
    get_model_info() should return a dictionary with metadata.
    """
    service = ModelService()
    info = service.get_model_info()

    assert isinstance(info, dict)
    assert "version" in info


def test_recommend_returns_list():
    """
    recommend() should return a list of recommendations.
    """
    service = ModelService()

    pet_profile = {
        "species": "dog",
        "breed_id": "dog-breed-001",
        "age_years": 5,
        "activity_level": "high",
        "health_conditions": ["joint"]
    }

    results = service.recommend(pet_profile, top_k=3)

    assert isinstance(results, list)


def test_recommend_respects_top_k():
    """
    recommend() should not return more items than top_k.
    """
    service = ModelService()

    pet_profile = {
        "species": "dog",
        "breed_id": "dog-breed-001",
        "age_years": 5,
        "activity_level": "high",
        "health_conditions": []
    }

    results = service.recommend(pet_profile, top_k=2)

    assert len(results) <= 2


def test_recommend_with_invalid_breed():
    """
    Invalid breed should not crash the recommender.
    """
    service = ModelService()

    pet_profile = {
        "species": "dog",
        "breed_id": "unknown-breed",
        "age_years": 3,
        "activity_level": "medium",
        "health_conditions": []
    }

    results = service.recommend(pet_profile, top_k=3)

    assert isinstance(results, list)