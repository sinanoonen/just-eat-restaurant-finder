/**
 * Fetches restaurant data from the Just Eat API based on the provided postcode.
 * @param postCode The postcode to search for restaurants.
 * @returns A promise that resolves to the raw data returned by the Just Eat API.
 * @throws An error if the fetch operation fails or if the response is not OK.
 */
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
