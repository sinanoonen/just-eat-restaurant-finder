export async function fetchRestaurantsByPostCode(
  postCode: string,
): Promise<unknown> {
  const normalized = postCode.replace(/\s+/g, "").toUpperCase();
  const url = `https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode/${normalized}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch restaurants: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
