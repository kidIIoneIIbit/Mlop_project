import json
import os

BASE_PATH = "data"

def load_breeds():
    path = os.path.join(BASE_PATH, "breeds.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["breeds"]

def load_foods():
    path = os.path.join(BASE_PATH, "foods.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["foods"]