from fastapi import APIRouter
from services.model_service import ModelService
from datetime import datetime

router = APIRouter()

model_service = ModelService()


@router.post("/")
def recommend(payload: dict):

    pet_profile = payload

    top_k = payload.get("top_k", 6)

    results = model_service.recommend(pet_profile, top_k)

    return {
        "pet_profile": pet_profile,
        "recommendations": results,
        "model_used": "RecommendationModel",
        "model_version": model_service.get_model_info().get("version"),
        "generated_at": datetime.utcnow().isoformat(),
    }
