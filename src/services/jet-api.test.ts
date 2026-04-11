import { vi, beforeEach, afterEach } from "vitest";
import { fetchRestaurantsByPostCode } from "./jet-api";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("fetchRestaurantsByPostCode", () => {
  it("returns the JSON body on a successful response", async () => {
    const fakeBody = { restaurants: [{ name: "Pizza Palace" }] };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => fakeBody,
    });

    const result = await fetchRestaurantsByPostCode("SW1A1AA");

    expect(result).toEqual(fakeBody);
  });

  it("throws an error on a non-OK response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchRestaurantsByPostCode("SW1A1AA")).rejects.toThrow(
      "Failed to fetch restaurants: 404 Not Found",
    );
  });

  it("normalizes the postcode correctly", async () => {
    const fakeBody = { restaurants: [] };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => fakeBody,
    });

    await fetchRestaurantsByPostCode(" sw1a 1aa ");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode/SW1A1AA",
    );
  });

  it("throws an error if fetch itself fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchRestaurantsByPostCode("SW1A1AA")).rejects.toThrow(
      "Network error",
    );
  });
});
