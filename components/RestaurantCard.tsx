import type { Restaurant } from "@/src/domain/restaurant";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { name, cuisines, rating, address } = restaurant;

  return (
    <article className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
        {name}
      </h2>

      <div className="flex items-center gap-1 mb-4">
        {rating > 0 ? (
          <>
            <span className="text-amber-500 text-lg">★</span>
            <span className="text-base font-semibold text-gray-900">
              {rating.toFixed(1)}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">Not yet rated</span>
        )}
      </div>

      {cuisines.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {cuisine}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-auto">
        {address || <span className="italic">Address not available</span>}
      </p>
    </article>
  );
}
