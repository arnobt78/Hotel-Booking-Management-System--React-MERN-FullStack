/** Soft localStorage cache keys for destination typeahead / Popular Destinations chips. */
export const HOTEL_PLACES_STORAGE_KEY = "hotelPlaces";
export const HOTEL_PLACES_TIME_KEY = "hotelPlacesTime";
/** React Query key — invalidated from invalidateHotelQueries on hotel CRUD. */
export const HOTEL_PLACES_QUERY_KEY = "hotelPlaces";
/** Soft TTL — React Query invalidation still clears immediately on hotel CRUD. */
export const HOTEL_PLACES_TTL_MS = 5 * 60 * 1000;

export type HotelPlaceSource = {
  city?: string;
  place?: string;
};

/** Unique destination labels from hotels (city preferred over place; never hotel name). */
export function extractHotelPlaces(hotels: HotelPlaceSource[]): string[] {
  return Array.from(
    new Set(
      hotels
        .map((hotel) => hotel.city || hotel.place)
        .filter(
          (place): place is string =>
            typeof place === "string" && place.length > 0,
        ),
    ),
  );
}

/** Drop soft cache so next fetch / RQ refetch cannot serve stale cities. */
export function clearHotelPlacesCache(): void {
  try {
    localStorage.removeItem(HOTEL_PLACES_STORAGE_KEY);
    localStorage.removeItem(HOTEL_PLACES_TIME_KEY);
  } catch {
    // localStorage may be unavailable (private mode) — ignore
  }
}

export function readHotelPlacesCache(): string[] | null {
  try {
    const cached = localStorage.getItem(HOTEL_PLACES_STORAGE_KEY);
    const cacheTime = localStorage.getItem(HOTEL_PLACES_TIME_KEY);
    if (!cached || !cacheTime) return null;
    const age = Date.now() - parseInt(cacheTime, 10);
    if (Number.isNaN(age) || age >= HOTEL_PLACES_TTL_MS) return null;
    const parsed = JSON.parse(cached) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return null;
  }
}

export function writeHotelPlacesCache(places: string[]): void {
  try {
    localStorage.setItem(HOTEL_PLACES_STORAGE_KEY, JSON.stringify(places));
    localStorage.setItem(HOTEL_PLACES_TIME_KEY, Date.now().toString());
  } catch {
    // ignore quota / private mode
  }
}
