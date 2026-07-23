import { QueryClient } from "react-query";

/**
 * Central React Query invalidation for hotel/booking CRUD.
 * Uses existing string/array keys so Home, Search, My Hotels, My Bookings,
 * and booking logs refresh without a full page reload (including back nav).
 */
export const invalidateHotelQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchMyHotels"),
    queryClient.invalidateQueries("fetchMyHotelById"),
    queryClient.invalidateQueries("fetchQuery"),
    queryClient.invalidateQueries("searchHotels"),
    queryClient.invalidateQueries("fetchHotelById"),
    queryClient.invalidateQueries("fetchHotelByID"),
  ]);
};

export const invalidateBookingQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchMyBookings"),
    queryClient.invalidateQueries("fetchHotelBookings"),
    // Hotel aggregates (totals) may change after a booking
    invalidateHotelQueries(queryClient),
  ]);
};
