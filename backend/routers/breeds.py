from fastapi import APIRouter, HTTPException
from services.data_loader import load_breeds

router = APIRouter()


@router.get("/{species}")
def get_breeds_by_species(species: str):
    breeds = load_breeds()
    filtered = [b for b in breeds if b["species"] == species]
    return {"breeds": filtered}


@router.get("/{species}/{breed_id}")
def get_breed_detail(species: str, breed_id: str):
    breeds = load_breeds()

    for breed in breeds:
        if breed["species"] == species and breed["id"] == breed_id:
            return breed

    raise HTTPException(status_code=404, detail="Breed not found")
