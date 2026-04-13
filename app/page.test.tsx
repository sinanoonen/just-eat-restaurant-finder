import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach, afterEach } from "vitest";
import Home from "./page";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("Home page", () => {
  it("shows restaurants after a successful search", async () => {
    const fakeRestaurants = [
      {
        name: "Pizza Palace",
        cuisines: ["Italian"],
        rating: 4.5,
        address: "1 Main St, London, SW1A 1AA",
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ restaurants: fakeRestaurants }),
    });

    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText("Enter a UK postcode");
    await user.type(input, "SW1A 1AA");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(screen.getByText("Pizza Palace")).toBeInTheDocument();
    });

    expect(screen.getByText(/Italian/)).toBeInTheDocument();
    expect(screen.getByText("★ 4.5")).toBeInTheDocument();
  });

  it("shows an error message on failed search", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    });

    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText("Enter a UK postcode");
    await user.type(input, "SW1A 1AA");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });
});
