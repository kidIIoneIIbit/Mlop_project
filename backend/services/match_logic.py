def calculate_match_score(food, pet_profile, breed):
    score = 0

    # 1️⃣ Tag overlap (max 40)
    pet_tags = set(pet_profile["health_conditions"])
    food_tags = set(food["tags"])

    overlap = pet_tags & food_tags
    score += min(len(overlap) * 10, 40)

    # 2️⃣ Protein adequacy (20 pts)
    if food["nutritional_content"]["protein_pct"] >= breed["nutritional_targets"]["protein_min"]:
        score += 20
    else:
        score -= 10

    # 3️⃣ Fat control (15 pts)
    if breed["weight_tendency"] == "overweight":
        if food["nutritional_content"]["fat_pct"] <= breed["nutritional_targets"]["fat_min"]:
            score += 15
    else:
        score += 10

    # 4️⃣ Rating (max 15)
    rating_bonus = (food["avg_rating"] - 3.5) * 5
    score += max(0, min(rating_bonus, 15))

    return max(10, min(99, round(score)))

# backend/services/match_logic.py

def generate_match_reasons(food, pet_profile, breed):
    reasons = []

    # Health tag match -> ต้องได้ "Supports {condition} health"
    for condition in pet_profile.get("health_conditions", []):
        if condition in food.get("tags", []):
            reasons.append(f"Supports {condition} health")

    # Protein adequacy -> "Meets protein requirement"
    protein_min = breed.get("nutritional_targets", {}).get("protein_min", 0)
    protein = food.get("nutritional_content", {}).get("protein_pct", 0)
    if protein >= protein_min:
        reasons.append("Meets protein requirement")

    # Overweight + low fat -> "Low fat suitable for weight control"
    if breed.get("weight_tendency") == "overweight":
        fat_min = breed.get("nutritional_targets", {}).get("fat_min", 0)
        fat = food.get("nutritional_content", {}).get("fat_pct", 0)
        if fat <= fat_min:
            reasons.append("Low fat suitable for weight control")

    # High rating -> "Highly rated by pet owners"
    if float(food.get("avg_rating", 0)) >= 4.5:
        reasons.append("Highly rated by pet owners")

    # จำกัด 3 เหตุผล
    return reasons[:3]