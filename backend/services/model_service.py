from services.data_loader import load_foods, load_breeds
from services.match_logic import calculate_match_score, generate_match_reasons
from services.nutrition import analyze_nutrition


class RecommendationService:

    def __init__(self):
        self.foods = load_foods()
        self.breeds = load_breeds()

    def get_breed(self, species, breed_id):
        for breed in self.breeds:
            if breed["species"] == species and breed["id"] == breed_id:
                return breed
        return None

    def recommend(self, pet_profile, top_k=6):
        breed = self.get_breed(pet_profile["species"], pet_profile["breed_id"])
        if not breed:
            return []

        scored = []

        for food in self.foods:
            if pet_profile["species"] not in food["species"]:
                continue

            score = calculate_match_score(food, pet_profile, breed)

            nutrition_gap = analyze_nutrition(food, breed)
            reasons = generate_match_reasons(food, pet_profile, breed)
            scored.append({
                "food_id": food["id"],
                "food_name": food["name"],
                "match_score": score,
                "match_reasons": reasons,
                "nutrition_gap_analysis": nutrition_gap,
                "price_usd": food["price_usd"],
                "avg_rating": food["avg_rating"]
            })

        scored.sort(key=lambda x: x["match_score"], reverse=True)

        return scored[:top_k]