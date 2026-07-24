import { QueryClient } from "react-query";
import {
  fetchBusinessInsightsDashboard,
  fetchBusinessInsightsForecast,
  fetchBusinessInsightsSystemStats,
} from "../api-client";
import {
  HOTEL_PLACES_QUERY_KEY,
  clearHotelPlacesCache,
} from "./hotel-places";

/**
 * Central React Query invalidation for hotel / booking / review / admin CRUD.
 * Call from every mutation onSuccess so current + other pages update without full reload.
 *
 * Keys in use (keep in sync with api-client callers):
 * - fetchMyHotels, fetchMyHotelById — owner dashboard
 * - fetchQuery, searchHotels, fetchHotels — home + search + admin hotels
 * - fetchHotelById / fetchHotelByID — hotel detail
 * - hotelPlaces — destination typeahead / Popular Destinations (also clears localStorage)
 * - fetchMyBookings, fetchHotelBookings, fetchAdminBookings — booking lists
 * - fetchHotelReviews, fetchAdminReviews — reviews
 * - fetchAdminUsers, fetchBusinessInsightsRollups, fetchAdminBusinessInsightsDashboard
 * - business-insights-dashboard | -forecast | -ops — AnalyticsDashboard page keys
 * - fetchCurrentUser — profile role / AdminRoute (invalidate on role PATCH)
 *
 * Insights invalidation lives only in invalidateHotelQueries; booking/review/admin
 * chain through hotel so Insights refreshes once per CRUD (no double invalidate).
 */

/** AnalyticsDashboard + admin insights rollups — called from invalidateHotelQueries */
export const invalidateBusinessInsightsQueries = async (
  queryClient: QueryClient,
) => {
  await Promise.all([
    queryClient.invalidateQueries("business-insights-dashboard"),
    queryClient.invalidateQueries("business-insights-forecast"),
    queryClient.invalidateQueries("business-insights-ops"),
    queryClient.invalidateQueries("fetchAdminBusinessInsightsDashboard"),
    queryClient.invalidateQueries("fetchBusinessInsightsRollups"),
  ]);
};

/** Prefetch Insights tabs on nav hover (MainNav / MobileNavLinks) */
export const prefetchBusinessInsightsQueries = (queryClient: QueryClient) => {
  void queryClient.prefetchQuery(
    "business-insights-dashboard",
    fetchBusinessInsightsDashboard,
  );
  void queryClient.prefetchQuery(
    "business-insights-forecast",
    fetchBusinessInsightsForecast,
  );
  void queryClient.prefetchQuery(
    "business-insights-ops",
    fetchBusinessInsightsSystemStats,
  );
};

export const invalidateHotelQueries = async (queryClient: QueryClient) => {
  // Soft LS cache must drop before RQ refetch or AdvancedSearch/SearchBar stay stale
  clearHotelPlacesCache();
  await Promise.all([
    queryClient.invalidateQueries("fetchMyHotels"),
    queryClient.invalidateQueries("fetchMyHotelById"),
    queryClient.invalidateQueries("fetchQuery"),
    queryClient.invalidateQueries("searchHotels"),
    queryClient.invalidateQueries("fetchHotels"),
    queryClient.invalidateQueries("fetchHotelById"),
    queryClient.invalidateQueries("fetchHotelByID"),
    queryClient.invalidateQueries(HOTEL_PLACES_QUERY_KEY),
    invalidateBusinessInsightsQueries(queryClient),
  ]);
};

export const invalidateBookingQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries("fetchMyBookings"),
    queryClient.invalidateQueries("fetchHotelBookings"),
    queryClient.invalidateQueries("fetchAdminBookings"),
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
    queryClient.invalidateQueries("fetchCurrentUser"),
    invalidateHotelQueries(queryClient),
  ]);
};
