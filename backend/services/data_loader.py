import json
import os

BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "data")


def load_foods():
    path = os.path.join(BASE_PATH, "foods.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)   # ← ไม่ต้อง ["foods"]


def load_breeds():
    path = os.path.join(BASE_PATH, "breeds.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)   # ← ไม่ต้อง ["breeds"]