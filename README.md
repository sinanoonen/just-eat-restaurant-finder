# Restaurant Finder

A Next.js web application that finds restaurants by UK postcode using the Just Eat Takeaway API, built as a coding assignment for the Just Eat Takeaway Early Careers Software Engineering Program.

## Quick Start

### Prerequisites

- Node.js 18 or newer
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/sinanoonen/just-eat-restaurant-finder.git
cd just-eat-restaurant-finder
npm install
```

### Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Run the tests

```bash
npm run test:run
```

This runs the full test suite once and exits. To run tests in watch mode during development:

```bash
npm test
```

## Architecture

The application is organized into layers that separate concerns and make each piece independently testable. The browser communicates with a Next.js route handler, which orchestrates calls to the Just Eat API through a dedicated service layer, passes the raw response through a parser that produces clean domain objects, and returns those objects to the client for rendering.

```
┌─────────────────────────────────────────────────┐
│ BROWSER (client-side)                           │
│   app/page.tsx                                  │
│   components/RestaurantList.tsx                 │
│   components/RestaurantCard.tsx                 │
└────────────────────┬────────────────────────────┘
                     │ fetch('/api/restaurants?postcode=...')
┌────────────────────▼────────────────────────────┐
│ NEXT.JS SERVER (route handler)                  │
│   app/api/restaurants/route.ts                  │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────┐
│ SERVICE LAYER    │   │ ADAPTER LAYER        │
│ src/services/    │   │ src/adapters/        │
│   jet-api.ts     │   │   jet-parser.ts      │
│ (fetches raw)    │   │ (cleans and types)   │
└────────┬─────────┘   └──────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ JUST EAT API (external)                      │
│ uk.api.just-eat.io/discovery/uk/...          │
└──────────────────────────────────────────────┘

DOMAIN LAYER: src/domain/restaurant.ts
  The Restaurant type used by every layer above.
```

### Domain layer (src/domain/)

The `Restaurant` type defines the shape of a restaurant as the rest of the application sees it: four fields (name, cuisines, rating, address), all required, all with plain types. It has no dependency on React, Next.js, or any external API, so it's portable and vendor-agnostic.

### Adapter layer (src/adapters/)

The `jet-parser.ts` file contains vendor-specific translation logic: it knows the shape of the JET API response and produces clean `Restaurant` objects. It's separated from the domain layer because its concerns are different. The domain describes *what a restaurant is*, the adapter describes *how to convert JET's format into one*. If we ever added a second data source, each would get its own adapter file alongside this one.

### Service layer (src/services/)

The `jet-api.ts` file is responsible for the HTTP boundary with the Just Eat API. It normalizes postcodes, constructs the request URL, calls `fetch`, and throws on non-OK responses. It returns the raw JSON body as `unknown`, deliberately leaving validation to the parser.

### API layer (app/api/restaurants/)

The route handler at `app/api/restaurants/route.ts` is the backend endpoint the browser calls. It reads the postcode query parameter, orchestrates the service and adapter layers, slices the result to the first 10 restaurants, and returns clean JSON. Error handling wraps the service call in try/catch and returns appropriate HTTP status codes.

### UI layer (app/page.tsx and components/)

The home page is a client component that manages search state, calls the API endpoint, and renders results. The layout uses a sticky header with the search input and quick-pick postcode buttons, and a responsive grid of restaurant cards. Loading, error, and empty states are handled explicitly.

## Design Decisions

### Next.js over a client-only SPA

The JET API blocks cross-origin browser requests, so a client-only app would need a separate backend to proxy the call. Next.js co-locates a server runtime with the frontend via route handlers, solving this in the same project. I chose it for the CORS workaround.

### The parser is defensive and never throws

`parseRestaurants` accepts `unknown` and validates at runtime before narrowing to a typed view. On any malformed input, it returns an empty array or skips the bad entries. Downstream code can always assume it receives clean data.

### The "first 10" rule lives in the route handler, not the parser

The brief asks for 10 restaurants. I put the `.slice(0, 10)` in the route handler rather than the parser so the parser stays general-purpose. Business rules like "how many to show" belong in the endpoint, not the data transformation.

### Postcode search with quick-pick buttons

The brief's example uses a fixed postcode, but I made it a user input so every layer of the architecture has a real reason to exist. The 16 postcodes from the brief's list are exposed as clickable buttons for users without a UK postcode in mind.

## Assumptions

The JET API response contains several ambiguities that required interpretation. The parser handles these as follows:

- **Rating.** Extracted from `rating.starRating`. Missing or null values default to `0`, which the UI displays as "Not yet rated".
- **Cuisines.** Extracted from the `cuisines` array (objects with a `name` field). Promotional tags like "Deals" and "Collect stamps" are included as they come from the API, filtering them would require a fragile hardcoded list.
- **Address.** Joined from `firstLine`, `city`, and `postalCode` with commas. Missing parts are filtered out; fully missing addresses display as "Address not available".
- **Unusable restaurants.** Restaurants with a missing or empty name are skipped entirely. The parser never throws on malformed input; it returns empty arrays or skips bad entries.

## Testing

The project uses [Vitest](https://vitest.dev/) for unit and component tests, with [React Testing Library](https://testing-library.com/react) for component interaction tests.

- **Parser tests** (`src/adapters/jet-parser.test.ts`) cover input validation, each field's edge cases, and a real-fixture test that loads a saved JET API response and verifies the parser handles the actual data shape.
- **API client tests** (`src/services/jet-api.test.ts`) mock the global `fetch` to verify URL construction, postcode normalization, and error handling without hitting the real API.
- **Component tests** (`app/page.test.tsx`) render the home page, simulate a user search with `userEvent`, and verify the success and error flows.

Run the full suite once with `npm run test:run` or in watch mode with `npm test`.

## Known Limitations and Improvements

- **Error messages are generic.** A 500 response and a network failure both produce "Something went wrong." More granular handling — distinguishing transient failures from permanent ones, offering a retry action — would improve the UX.

- **No filters or sorting.** The brief didn't require these, and I deliberately excluded them to stay focused on displaying the core data well. A future version could add cuisine filters and sort-by-rating.

- **Accessibility has not been audited.** The components use semantic HTML (`<article>`, `<h2>`, proper button labels) and are keyboard-navigable, but haven't been tested with a screen reader.

## AI Usage

Per the assignment guidelines, I used AI assistance during this project as a tutor and code reviewer. My process was:

- **Design discussion.** Before each file, I discussed architectural choices with AI — folder structure, naming conventions, where business rules should live, how to handle edge cases in the parser. The decisions are mine, but they were informed by structured back-and-forth.
- **Code review.** After writing each file, I reviewed it with AI acting as a code reviewer, which caught small issues (trimming whitespace in the parser, naming inconsistencies, a bug where `currentPostcode` wasn't being updated) that I then fixed myself.
