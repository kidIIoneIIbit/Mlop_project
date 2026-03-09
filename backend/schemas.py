from pydantic import BaseModel
from typing import List, Optional


class PetProfileRequest(BaseModel):
    name: Optional[str] = None
    species: str
    breed_id: str
    age_years: float
    weight_kg: float
    activity_level: str
    health_conditions: List[str]
    top_k: int = 6

class NutrientStatus(BaseModel):
    required: float
    provided: float
    status: str  # ok / below / above

class RecommendationItem(BaseModel):
    rank: int
    food_id: str
    food_name: str
    match_score: int
    match_reasons: List[str]
    nutrition_gap_analysis: dict
    price_usd: float
    avg_rating: float

class RecommendationResponse(BaseModel):
    pet_profile: dict
    breed_insights: dict
    recommendations: List[RecommendationItem]
    model_used: str
    model_version: str
    generated_at: str

class CompareRequest(BaseModel):
    food_ids: List[str]
    pet_profile: PetProfileRequest


class CompareItem(BaseModel):
    food_id: str
    name: str
    match_score: int
    verdict: str


class CompareResponse(BaseModel):
    comparison: List[CompareItem]
    winner: dict
