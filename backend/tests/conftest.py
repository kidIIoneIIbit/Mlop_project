import sys
import os
import pytest
from fastapi.testclient import TestClient

# ทำให้ import จาก services ได้ตรง ๆ
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_dog_profile():
    return {
        "name": "Buddy",
        "species": "dog",
        "breed_id": "labrador_retriever",
        "age_years": 4,
        "weight_kg": 30,
        "activity_level": "moderate",
        "health_conditions": ["joint"],
        "top_k": 3
    }


@pytest.fixture
def sample_cat_profile():
    return {
        "name": "Luna",
        "species": "cat",
        "breed_id": "persian",
        "age_years": 6,
        "weight_kg": 5,
        "activity_level": "low",
        "health_conditions": ["skin"],
        "top_k": 3
    }


@pytest.fixture
def sample_food():
    return {
        "tags": ["joint", "skin"],
        "avg_rating": 4.7,
        "nutritional_content": {
            "protein_pct": 30,
            "fat_pct": 12,
            "fiber_pct": 5
        }
    }


@pytest.fixture
def sample_breed():
    return {
        "weight_tendency": "overweight",
        "common_health_issues": ["joint"],
        "nutritional_targets": {
            "protein_min": 25,
            "fat_min": 12,
            "fiber_min": 4
        }
    }