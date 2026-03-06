# backend/tests/test_model_service.py
from services.model_service import RecommendationService


def test_get_breed_found():
    service = RecommendationService()
    breed = service.get_breed("dog", "labrador_retriever")
    assert breed is not None
    assert breed["id"] == "labrador_retriever"


def test_get_breed_not_found():
    service = RecommendationService()
    breed = service.get_breed("dog", "fake")
    assert breed is None


def test_recommend_returns_list(sample_dog_profile):
    service = RecommendationService()
    results = service.recommend(sample_dog_profile, top_k=5)
    assert isinstance(results, list)


def test_recommend_sorted_desc(sample_dog_profile):
    service = RecommendationService()
    results = service.recommend(sample_dog_profile, top_k=6)
    scores = [r["match_score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_recommend_has_nutrition_gap(sample_dog_profile):
    service = RecommendationService()
    results = service.recommend(sample_dog_profile, top_k=3)
    for r in results:
        assert "nutrition_gap_analysis" in r