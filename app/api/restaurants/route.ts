import { fetchRestaurantsByPostCode } from "@/src/services/jet-api";
import { parseRestaurants } from "@/src/adapters/jet-parser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postCode = searchParams.get("postcode");
  if (!postCode) {
    return Response.json({ error: "Missing postCode parameter" }, { status: 400 });
  }

  try {
    const data = await fetchRestaurantsByPostCode(postCode);
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
