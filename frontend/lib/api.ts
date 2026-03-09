import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export interface Breed {
  id: string;
  name: string;
  species: string;
  size: string;
}

export interface RecommendationItem {
  food_id: string;
  score: number;
  name: string;
  brand: string;
  food_type: string;
  species: string;
  nutritional_content: {
    protein: number;
    fat: number;
    fiber: number;
    kcal_per_100g: number;
  };
  tags: string[];
  badges: string[];
  price_usd: number;
  avg_rating: number;
  match_reasons: string[];
}

export interface RecommendationResponse {
  pet_profile: Record<string, unknown>;
  recommendations: RecommendationItem[];
  model_used: string;
  model_version: string;
  generated_at: string;
}

export interface CompareItem extends RecommendationItem {}

export interface CompareResponse {
  comparison: CompareItem[];
  winner: CompareItem | null;
}

export function fetchBreeds(species: string) {
  return api.get<{ breeds: Breed[] }>(`/breeds/${species}`);
}

export function postRecommendations(payload: {
  name?: string;
  species: string;
  breed_id: string;
  age_years: number;
  weight_kg: number;
  activity_level: string;
  health_conditions: string[];
  top_k?: number;
}) {
  return api.post<RecommendationResponse>("/recommendations/", payload);
}

export function postCompare(payload: {
  food_ids: string[];
  species: string;
  breed_id: string;
  age_years: number;
  activity_level: string;
  health_conditions: string[];
}) {
  return api.post<CompareResponse>("/compare/", payload);
}

export default api;
