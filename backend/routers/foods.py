from fastapi import APIRouter, Query, HTTPException
from services.data_loader import load_foods

router = APIRouter()


@router.get("/")
def get_foods(
    species: str = Query(None),
    food_type: str = Query(None),
    tag: str = Query(None)
):
    foods = load_foods()

    if species:
        foods = [f for f in foods if f["species"] == species]

    if food_type:
        foods = [f for f in foods if f["food_type"] == food_type]

    if tag:
        foods = [f for f in foods if tag in f["tags"]]

    return {"foods": foods}


@router.get("/{food_id}")
def get_food_detail(food_id: str):
    foods = load_foods()

    for food in foods:
        if food["id"] == food_id:
            return food

    raise HTTPException(status_code=404, detail="Food not found")
