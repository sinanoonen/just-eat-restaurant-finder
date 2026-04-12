import type { Restaurant } from "@/src/domain/restaurant";
import { RestaurantCard } from "./RestaurantCard";

type RestaurantListProps = {
  restaurants: Restaurant[];
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 text-lg">
        No restaurants found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.name} restaurant={restaurant} />
      ))}
    </div>
  );
}
