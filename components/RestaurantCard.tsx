import type { Restaurant } from "@/src/domain/restaurant";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { name, cuisines, rating, address } = restaurant;

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{name}</h2>

      <div className="text-sm text-gray-600 mb-3">
        {rating > 0 ? (
          <span>★ {rating.toFixed(1)}</span>
        ) : (
          <span className="text-gray-400">Not yet rated</span>
        )}
      </div>

      {cuisines.length > 0 && (
        <p className="text-sm text-gray-700 mb-3">{cuisines.join(", ")}</p>
      )}

      <p className="text-sm text-gray-500">
        {address || "Address not available"}
      </p>
    </article>
  );
}
