"use client";

import { useState } from "react";
import { RestaurantList } from "@/components/RestaurantList";
import type { Restaurant } from "@/src/domain/restaurant";

const SUGGESTED_POSTCODES = [
  "CT1 2EH",
  "BS1 4DJ",
  "L4 0TH",
  "NE9 7TY",
  "SW1A 1AA",
  "CF11 8AZ",
  "M16 0RA",
  "EH1 1RE",
  "BN1 1AE",
  "CB7 4DL",
  "LS2 7HY",
  "G3 8AG",
  "PL4 0DW",
  "B26 3QJ",
  "DH4 5QZ",
  "BT7 1NN",
];

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPostcode, setCurrentPostcode] = useState<string | null>(null);

  async function handleSearch(searchPostcode: string) {
    if (!searchPostcode.trim()) {
      setError("Please enter a postcode.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/restaurants?postcode=${encodeURIComponent(searchPostcode.trim())}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      setRestaurants(data.restaurants);
      setCurrentPostcode(searchPostcode.trim().toUpperCase());
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Restaurant Finder
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(postcode);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter a UK postcode"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTED_POSTCODES.map((pc) => (
              <button
                key={pc}
                onClick={() => handleSearch(pc)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                {pc}
              </button>
            ))}
          </div>

          {currentPostcode && (
            <p className="mt-3 text-sm text-gray-600">
              Showing results for{" "}
              <span className="font-semibold">{currentPostcode}</span>
            </p>
          )}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <p className="text-center text-gray-500 py-16 text-lg">Loading...</p>
        )}

        {error && (
          <p className="text-center text-red-600 py-16 text-lg">{error}</p>
        )}

        {!loading && !error && restaurants.length === 0 && !currentPostcode && (
          <p className="text-center text-gray-500 py-16 text-lg">
            Enter a postcode to find restaurants
          </p>
        )}

        {!loading && !error && currentPostcode && (
          <RestaurantList restaurants={restaurants} />
        )}
      </section>
    </main>
  );
}
