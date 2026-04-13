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

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPostcode, setCurrentPostcode] = useState<string | null>(null);

  async function handleSearch(searchPostcode: string) {
    const trimmed = searchPostcode.trim();

    if (!trimmed) {
      setError("Please enter a postcode.");
      return;
    }

    if (!UK_POSTCODE_REGEX.test(trimmed)) {
      setError("Please enter a valid UK postcode (e.g. SW1A 1AA).");
      setCurrentPostcode(null);
      setRestaurants([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/restaurants?postcode=${encodeURIComponent(trimmed)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      setRestaurants(data.restaurants);
      setCurrentPostcode(trimmed.toUpperCase());
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-orange-400 z-10 py-5 shadow-md">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Restaurant Finder
            </h1>
            <p className="text-sm text-white/80 italic mt-0.5">
              Discover places to eat near you
            </p>
          </div>

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
              className="flex-1 px-4 py-2 bg-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-white text-orange-400 font-semibold rounded-md hover:bg-orange-50"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTED_POSTCODES.map((pc) => (
              <button
                key={pc}
                onClick={() => handleSearch(pc)}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              >
                {pc}
              </button>
            ))}
          </div>

          {currentPostcode && (
            <p className="mt-3 text-sm text-orange-50">
              Showing results for{" "}
              <span className="font-semibold text-white">
                {currentPostcode}
              </span>
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
