# backend/services/model_service.py

from ml_model.load_model import get_model


class ModelService:

    def __init__(self):
        self.model = get_model()

    def recommend(self, pet_profile: dict, top_k: int = 6):

        results = self.model.recommend(pet_profile, top_k)

        return [r.to_dict() for r in results]

    def get_model_info(self):
        return self.model.get_model_info()