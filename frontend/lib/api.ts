// lib/api.ts — Typed API client for the PetriCommend backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BreedOption {
  breed_id: string;
  name: string;
}

export interface NutritionalContent {
  protein: number;
  fat: number;
  fiber: number;
  kcal_per_100g?: number;
}

export interface FoodDetail {
  id: string;
  name: string;
  brand: string;
  species: string;
  food_type: string;
  nutritional_content: NutritionalContent;
  tags: string[];
  certifications: string[];
  badges: string[];
  price_usd: number;
  avg_rating: number;
}

export interface RecommendationItem {
  food_id: string;
  score: number;          // 0–100 float
  name: string;
  brand: string;
  food_type: string;      // e.g. "dry", "wet", "raw"
  species: string;
  nutritional_content: NutritionalContent;
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

export interface PetProfilePayload {
  name?: string;
  species: string;          // "dog" | "cat"
  breed_id: string;         // e.g. "dog-breed-001"
  age_years: number;
  weight_kg: number;
  activity_level: string;   // "high" | "medium" | "low"
  health_conditions: string[]; // ["kidney","weight","joint","digestive","skin"]
  top_k?: number;
}

// ── API Calls ────────────────────────────────────────────────────────────────

/**
 * GET /breeds/{species}
 * Returns the list of breeds for a species.
 * Handles both array and { breeds: [...] } response shapes.
 */
export async function getBreeds(species: string): Promise<BreedOption[]> {
  const res = await fetch(`${API_BASE}/breeds/${species}`);
  if (!res.ok) throw new Error(`Failed to fetch breeds (${res.status})`);
  const data = await res.json();
  // Backend returns { breeds: [...] } where each item uses "id" not "breed_id"
  const raw: Record<string, unknown>[] = Array.isArray(data) ? data : data.breeds ?? [];
  return raw.map((b) => ({
    breed_id: (b.breed_id ?? b.id) as string,
    name:     b.name as string,
  }));
}

/**
 * POST /recommendations/
 * Returns ranked food recommendations for the given pet profile.
 */
export async function getRecommendations(
  payload: PetProfilePayload
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommendations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

/**
 * GET /foods/
 * Returns all food items, with optional filters.
 */
export async function getFoods(params?: {
  species?: string;
  food_type?: string;
  tag?: string;
}): Promise<FoodDetail[]> {
  const query = new URLSearchParams();
  if (params?.species)   query.set('species',   params.species);
  if (params?.food_type) query.set('food_type', params.food_type);
  if (params?.tag)       query.set('tag',       params.tag);
  const url = `${API_BASE}/foods/${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch foods (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.foods ?? [];
}

/**
 * GET /foods/{food_id}
 * Returns full detail for a single food item.
 */
export async function getFoodDetail(foodId: string): Promise<FoodDetail> {
  const res = await fetch(`${API_BASE}/foods/${foodId}`);
  if (!res.ok) throw new Error(`Food not found (${res.status})`);
  return res.json();
}

/**
 * GET /health
 * Simple health check — useful for verifying connectivity.
 */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}
