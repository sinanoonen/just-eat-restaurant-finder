import { parseRestaurants } from "./jet-parser";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("parseRestaurants - input validation", () => {
  it("returns an empty array when input is null", () => {
    expect(parseRestaurants(null)).toEqual([]);
  });

  it("returns an empty array when input is undefined", () => {
    expect(parseRestaurants(undefined)).toEqual([]);
  });

  it("returns an empty array when input is not an object", () => {
    expect(parseRestaurants("invalid")).toEqual([]);
    expect(parseRestaurants(123)).toEqual([]);
    expect(parseRestaurants([])).toEqual([]);
  });

  it("returns an empty array when restaurants field is missing", () => {
    expect(parseRestaurants({})).toEqual([]);
  });

  it("returns an empty array when restaurants field is not an array", () => {
    expect(parseRestaurants({ restaurants: "invalid" })).toEqual([]);
    expect(parseRestaurants({ restaurants: 123 })).toEqual([]);
  });
});

describe("parseRestaurants - per-restaurant parsing", () => {
  it("parses a complete restaurant correctly", () => {
    const input = {
      restaurants: [
        {
          name: "Pizza Palace",
          cuisines: [{ name: "Italian" }, { name: "Pizza" }],
          rating: { starRating: 4.5 },
          address: {
            firstLine: "27 Strutton Ground",
            city: "London",
            postalCode: "SW1P 2HY",
          },
        },
      ],
    };

    const result = parseRestaurants(input);

    expect(result).toEqual([
      {
        name: "Pizza Palace",
        cuisines: ["Italian", "Pizza"],
        rating: 4.5,
        address: "27 Strutton Ground, London, SW1P 2HY",
      },
    ]);
  });

  it("handles missing optional fields gracefully", () => {
    const input = {
      restaurants: [
        {
          name: "Sushi Spot",
          rating: { starRating: 4 },
        },
      ],
    };

    const result = parseRestaurants(input);

    expect(result).toEqual([
      {
        name: "Sushi Spot",
        cuisines: [],
        rating: 4,
        address: "",
      },
    ]);
  });

  it("skips restaurants with missing or empty name", () => {
    const input = {
      restaurants: [
        {
          cuisines: [{ name: "Mexican" }],
          rating: { starRating: 3.5 },
          address: {
            firstLine: "123 Taco St",
            city: "Los Angeles",
            postalCode: "90001",
          },
        },
        {
          name: "   ",
          cuisines: [{ name: "Mexican" }],
          rating: { starRating: 3.5 },
          address: {
            firstLine: "123 Taco St",
            city: "Los Angeles",
            postalCode: "90001",
          },
        },
      ],
    };

    const result = parseRestaurants(input);

    expect(result).toEqual([]);
  });

  it("handles null and undefined fields within a restaurant", () => {
    const input = {
      restaurants: [
        {
          name: "Burger Barn",
          cuisines: [],
          rating: null,
          address: null,
        },
      ],
    };

    const result = parseRestaurants(input);

    expect(result).toEqual([
      {
        name: "Burger Barn",
        cuisines: [],
        rating: 0,
        address: "",
      },
    ]);
  });

  it("handles restaurant with partial address", () => {
    const input = {
      restaurants: [
        {
          name: "Cafe Corner",
          cuisines: [{ name: "Cafe" }],
          rating: { starRating: 4 },
          address: {
            firstLine: "456 Coffee Rd",
            city: null,
            postalCode: "12345",
          },
        },
      ],
    };

    const result = parseRestaurants(input);

    expect(result).toEqual([
      {
        name: "Cafe Corner",
        cuisines: ["Cafe"],
        rating: 4,
        address: "456 Coffee Rd, 12345",
      },
    ]);
  });
});

describe("parseRestaurants - real fixture", () => {
  it("parses the real JET API response into valid restaurants", () => {
    const fixturePath = join(
      __dirname,
      "..",
      "fixtures",
      "sample-response.json"
    );
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8"));

    const result = parseRestaurants(fixture);

    expect(result.length).toBeGreaterThan(0);
    result.forEach((restaurant) => {
      expect(typeof restaurant.name).toBe("string");
      expect(restaurant.name.length).toBeGreaterThan(0);
      expect(Array.isArray(restaurant.cuisines)).toBe(true);
      expect(typeof restaurant.rating).toBe("number");
      expect(typeof restaurant.address).toBe("string");
    });
  });
});