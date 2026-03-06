from fastapi import APIRouter
from schemas import PetProfileRequest
from services.model_service import RecommendationService
from datetime import datetime

router = APIRouter()

service = RecommendationService()


@router.post("/")
def recommend(profile: PetProfileRequest):

    pet_dict = profile.dict()

    results = service.recommend(pet_dict, top_k=profile.top_k)

    return {
        "pet_profile": pet_dict,
        "recommendations": results,
        "model_used": "cbf_baseline",
        "model_version": "v0.1",
        "generated_at": datetime.utcnow().isoformat()
    }