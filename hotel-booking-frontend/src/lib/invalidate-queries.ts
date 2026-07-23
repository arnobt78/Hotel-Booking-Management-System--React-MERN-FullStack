import { QueryClient } from "react-query";

/**
 * Central React Query invalidation for hotel / booking / review / admin CRUD.
 * Call from every mutation onSuccess so current + other pages update without full reload.
 *
 * Keys in use (keep in sync with api-client callers):
 * - fetchMyHotels, fetchMyHotelById — owner dashboard
 * - fetchQuery, searchHotels, fetchHotels — home + search + admin hotels
 * - fetchHotelById / fetchHotelByID — hotel detail
 * - fetchMyBookings, fetchHotelBookings, fetchAdminBookings — booking lists
 * - fetchHotelReviews, fetchAdminReviews — reviews
 * - fetchAdminUsers, fetchBusinessInsightsRollups, fetchBusinessInsightsDashboard
 * - fetchCurrentUser — profile role / AdminRoute (invalidate on role PATCH)
 */
export const invalidateHotelQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchMyHotels"),
    queryClient.invalidateQueries("fetchMyHotelById"),
    queryClient.invalidateQueries("fetchQuery"),
    queryClient.invalidateQueries("searchHotels"),
    queryClient.invalidateQueries("fetchHotels"),
    queryClient.invalidateQueries("fetchHotelById"),
    queryClient.invalidateQueries("fetchHotelByID"),
  ]);
};

export const invalidateBookingQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchMyBookings"),
    queryClient.invalidateQueries("fetchHotelBookings"),
    queryClient.invalidateQueries("fetchAdminBookings"),
    queryClient.invalidateQueries("fetchBusinessInsightsDashboard"),
    queryClient.invalidateQueries("fetchAdminBusinessInsightsDashboard"),
    invalidateHotelQueries(queryClient),
  ]);
};

/** After create/update review — refresh detail, my-hotels stats, admin lists */
export const invalidateReviewQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchHotelReviews"),
    queryClient.invalidateQueries("fetchAdminReviews"),
    invalidateHotelQueries(queryClient),
  ]);
};

/** Admin shell lists + rollups + current user (role changes refresh Admin link) */
export const invalidateAdminQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchAdminUsers"),
    queryClient.invalidateQueries("fetchAdminReviews"),
    queryClient.invalidateQueries("fetchAdminBookings"),
    queryClient.invalidateQueries("fetchBusinessInsightsRollups"),
    queryClient.invalidateQueries("fetchBusinessInsightsDashboard"),
    queryClient.invalidateQueries("fetchAdminBusinessInsightsDashboard"),
    queryClient.invalidateQueries("fetchCurrentUser"),
    invalidateHotelQueries(queryClient),
  ]);
};
