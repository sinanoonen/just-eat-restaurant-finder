import { fetchRestaurantsByPostCode } from "@/src/services/jet-api";
import { parseRestaurants } from "@/src/adapters/jet-parser";

/**
 * API route handler for fetching restaurants based on a postcode.
 * Expects a query parameter "postcode" in the request URL.
 * Responds with a JSON object containing an array of restaurants or an error message.
 * @param request The incoming HTTP request object.
 * @returns A Response object containing the JSON data or an error message.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  if (!postcode) {
    return Response.json({ error: "Missing postcode parameter" }, { status: 400 });
  }

  try {
    const data = await fetchRestaurantsByPostCode(postcode);
    const restaurants = parseRestaurants(data).slice(0, 10);
    return Response.json({ restaurants });
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return Response.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 },
    );
  }
}
