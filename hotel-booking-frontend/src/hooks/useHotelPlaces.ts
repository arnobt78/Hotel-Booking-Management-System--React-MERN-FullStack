import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import {
  HOTEL_PLACES_QUERY_KEY,
  HOTEL_PLACES_TTL_MS,
  clearHotelPlacesCache,
  extractHotelPlaces,
  readHotelPlacesCache,
  writeHotelPlacesCache,
} from "../lib/hotel-places";

/**
 * Shared destination list for AdvancedSearch + SearchBar.
 * Soft localStorage TTL avoids hammering /api/hotels; CRUD clears cache + invalidates this key.
 */
export function useHotelPlaces() {
  const query = useQuery(
    HOTEL_PLACES_QUERY_KEY,
    async () => {
      const soft = readHotelPlacesCache();
      if (soft) return soft;

      const hotels = await apiClient.fetchHotels();
      const places = extractHotelPlaces(hotels);
      writeHotelPlacesCache(places);
      return places;
    },
    {
      staleTime: HOTEL_PLACES_TTL_MS,
      // After invalidateHotelQueries clears LS, refetch must hit the network
      onError: () => {
        clearHotelPlacesCache();
      },
    },
  );

  return {
    places: query.data ?? [],
    isLoadingPlaces: query.isLoading || query.isFetching,
    error: query.error,
  };
}
