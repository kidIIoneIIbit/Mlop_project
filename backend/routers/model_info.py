from fastapi import APIRouter
from services.model_service import ModelService

router = APIRouter()

model_service = ModelService()


@router.get("/info")
def model_info():

    info = model_service.get_model_info()

    return {
        "model_name": "PetriCommend",
        "version": info.get("version"),
        "mode": info.get("mode"),
        "experiment": info.get("experiment"),
        "created_at": info.get("created_at"),
        "metrics": info.get("metrics"),
    }
