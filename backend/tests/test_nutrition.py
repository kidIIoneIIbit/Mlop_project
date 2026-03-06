from services.nutrition import analyze_nutrition


def test_all_below(sample_food, sample_breed):
    food = sample_food.copy()
    food["nutritional_content"] = {
        "protein_pct": 10,
        "fat_pct": 5,
        "fiber_pct": 1
    }
    result = analyze_nutrition(food, sample_breed)
    assert result["protein_pct"]["status"] == "below"
    assert result["fat_pct"]["status"] == "below"
    assert result["fiber_pct"]["status"] == "below"


def test_all_above(sample_food, sample_breed):
    food = sample_food.copy()
    food["nutritional_content"] = {
        "protein_pct": 40,
        "fat_pct": 20,
        "fiber_pct": 15
    }
    result = analyze_nutrition(food, sample_breed)
    assert result["protein_pct"]["status"] == "above"


def test_mixed_statuses(sample_food, sample_breed):
    food = sample_food.copy()
    food["nutritional_content"] = {
        "protein_pct": 25,
        "fat_pct": 5,
        "fiber_pct": 15
    }
    result = analyze_nutrition(food, sample_breed)
    assert result["protein_pct"]["status"] == "ok"
    assert result["fat_pct"]["status"] == "below"
    assert result["fiber_pct"]["status"] == "above"


def test_boundary_at_min(sample_food, sample_breed):
    food = sample_food.copy()
    food["nutritional_content"]["protein_pct"] = 25
    result = analyze_nutrition(food, sample_breed)
    assert result["protein_pct"]["status"] == "ok"


def test_boundary_at_buffer(sample_food, sample_breed):
    food = sample_food.copy()
    food["nutritional_content"]["protein_pct"] = 30
    result = analyze_nutrition(food, sample_breed)
    assert result["protein_pct"]["status"] == "ok"