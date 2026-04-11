import type { Restaurant } from "@/src/domain/restaurant";

type RawCuisine = {
  name?: string | null;
};

type RawRating = {
  starRating?: number | null;
};

type RawAddress = {
  firstLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
};

type RawRestaurant = {
  name?: string | null;
  cuisines?: RawCuisine[] | null;
  rating?: RawRating | null;
  address?: RawAddress | null;
};

type RawJetResponse = {
  restaurants?: RawRestaurant[] | null;
};

function extractCuisines(raw: RawRestaurant): string[] {
  if (!raw.cuisines) return [];
  return raw.cuisines
    .map((cuisine) => cuisine.name?.trim())
    .filter((name): name is string => !!name);
}

function extractRating(raw: RawRestaurant): number {
  return raw.rating?.starRating ?? 0;
}

function formatAddress(raw: RawRestaurant): string {
  const address = raw.address;
  if (!address) return "";
  const parts = [
    address.firstLine?.trim(),
    address.city?.trim(),
    address.postalCode?.trim(),
  ].filter((part): part is string => !!part);
  return parts.join(", ");
}

function parseSingleRestaurant(raw: RawRestaurant): Restaurant | null {
  const name = raw.name?.trim();
  if (!name) return null;
  return {
    name,
    cuisines: extractCuisines(raw),
    rating: extractRating(raw),
    address: formatAddress(raw),
  };
}

export function parseRestaurants(raw: unknown): Restaurant[] {
  if (typeof raw !== "object" || raw === null) return [];
  const response = raw as RawJetResponse;
  if (!Array.isArray(response.restaurants)) return [];
  return response.restaurants
    .map(parseSingleRestaurant)
    .filter((restaurant): restaurant is Restaurant => restaurant !== null);
}
