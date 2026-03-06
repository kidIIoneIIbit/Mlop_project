def analyze_nutrition(food, breed):
    targets = breed["nutritional_targets"]

    result = {}

    for key in ["protein", "fat", "fiber"]:
        required = targets[f"{key}_min"]
        provided = food["nutritional_content"][f"{key}_pct"]

        if provided < required:
            status = "below"
        elif provided > required + 5:
            status = "above"
        else:
            status = "ok"

        result[f"{key}_pct"] = {
            "required": required,
            "provided": provided,
            "status": status
        }

    return result