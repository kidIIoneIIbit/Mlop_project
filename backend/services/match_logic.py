def calculate_match_score(food, pet_profile, breed):
    score = 0

    # 1. Tag overlap (max 40)
    pet_tags = set(pet_profile.get("health_conditions", []))
    food_tags = set(food.get("tags", []))

    overlap = pet_tags & food_tags
    score += min(len(overlap) * 10, 40)

    # 2. Protein adequacy (20 pts)
    protein = food["nutritional_content"].get("protein", 0)
    protein_min = breed["nutritional_targets"].get("protein_min", 0)
    if protein >= protein_min:
        score += 20
    else:
        score -= 10

    # 3. Fat control (15 pts)
    fat = food["nutritional_content"].get("fat", 0)
    fat_min = breed["nutritional_targets"].get("fat_min", 0)
    if breed.get("weight_tendency") == "overweight":
        if fat <= fat_min:
            score += 15
    else:
        score += 10

    # 4. Rating (max 15)
    rating_bonus = (food.get("avg_rating", 0) - 3.5) * 5
    score += max(0, min(rating_bonus, 15))

    return max(10, min(99, round(score)))


def generate_match_reasons(food, pet_profile, breed):
    reasons = []

    tag_map = {
        "joint":     ["joint-support", "glucosamine"],
        "skin":      ["skin-health", "omega-rich", "allergy-friendly"],
        "kidney":    ["kidney-support", "kidney-care"],
        "digestive": ["sensitive-stomach", "easy-digest", "digestive-care"],
        "weight":    ["weight-management", "weight-control", "high-fiber"],
    }

    food_tags = set(food.get("tags", []) + food.get("badges", []))

    for condition in pet_profile.get("health_conditions", []):
        for tag in tag_map.get(condition, []):
            if tag in food_tags:
                reasons.append(f"Supports {condition} health")
                break

    protein_min = breed.get("nutritional_targets", {}).get("protein_min", 0)
    protein = food.get("nutritional_content", {}).get("protein", 0)
    if protein >= protein_min:
        reasons.append("Meets protein requirement")

    if breed.get("weight_tendency") == "overweight":
        fat_min = breed.get("nutritional_targets", {}).get("fat_min", 0)
        fat = food.get("nutritional_content", {}).get("fat", 0)
        if fat <= fat_min:
            reasons.append("Low fat suitable for weight control")

    if float(food.get("avg_rating", 0)) >= 4.5:
        reasons.append("Highly rated by pet owners")

    return reasons[:3]
