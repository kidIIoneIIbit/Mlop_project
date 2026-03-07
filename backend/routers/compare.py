from fastapi import APIRouter
from services.model_service import ModelService

router = APIRouter()

model_service = ModelService()


@router.post("/")
def compare(payload: dict):

    pet_profile = {
        "species": payload["species"],
        "breed_id": payload["breed_id"],
        "age_years": payload.get("age_years", 3),
        "activity_level": payload.get("activity_level", "medium"),
        "health_conditions": payload.get("health_conditions", []),
    }

    food_ids = payload.get("food_ids", [])

    # เรียก recommender
    results = model_service.recommend(pet_profile, top_k=50)

    # filter เฉพาะ food ที่ user ส่งมา
    comparison = [r for r in results if r["food_id"] in food_ids]

    if not comparison:
        return {
            "comparison": [],
            "winner": None
        }

    # หา winner
    winner = max(comparison, key=lambda x: x["score"])

    return {
        "comparison": comparison,
        "winner": winner
    }