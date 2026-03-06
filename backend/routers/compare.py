from fastapi import APIRouter
from schemas import CompareRequest
from services.model_service import RecommendationService

router = APIRouter()

service = RecommendationService()


@router.post("/")
def compare_foods(request: CompareRequest):
    pet_profile = request.pet_profile.dict()
    breed = service.get_breed(
        pet_profile["species"],
        pet_profile["breed_id"]
    )

    foods = service.foods

    results = []

    for food_id in request.food_ids:
        food = next((f for f in foods if f["id"] == food_id), None)
        if not food:
            continue

        score = service.recommend(pet_profile, top_k=50)
        score_map = {f["food_id"]: f["match_score"] for f in score}

        results.append({
            "food_id": food["id"],
            "name": food["name"],
            "match_score": score_map.get(food["id"], 0)
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    winner = results[0] if results else None

    return {
        "comparison": results,
        "winner": winner
    }