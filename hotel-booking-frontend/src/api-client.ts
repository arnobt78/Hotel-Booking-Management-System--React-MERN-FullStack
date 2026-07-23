import axiosInstance, { getApiBaseUrl } from "./lib/api-client";
import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
  HotelWithBookingsType,
  BookingType,
  ReviewType,
} from "../../shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
import { queryClient } from "./main";

export { getApiBaseUrl };

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  return response.data;
};

export const signIn = async (formData: SignInFormData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);

  // Store JWT token from response body in localStorage
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }

  // Store user info for profile avatar / UsernameMenu
  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }
  if (response.data?.user) {
    const { email, firstName, lastName } = response.data.user;
    if (email) localStorage.setItem("user_email", email);
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    if (name) localStorage.setItem("user_name", name);
  }

  // Refresh validateToken cache so isLoggedIn flips without full reload
  try {
    await validateToken();
    await queryClient.invalidateQueries("validateToken");
    await queryClient.refetchQueries("validateToken");
  } catch {
    // Token stored — UI still works if validate races; do not spam console
  }

  return response.data;
};

/** Clears JWT keys when session is invalid */
const clearAuthStorage = () => {
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_image");
};

export const validateToken = async () => {
  const token = localStorage.getItem("session_id");
  // No JWT — guest; skip network (callers should also gate with enabled)
  if (!token) {
    return null;
  }

  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      clearAuthStorage();
      throw new Error("Token invalid");
    }
    throw new Error("Token validation failed");
  }
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  // Clear localStorage (JWT tokens and user info)
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_image");

  return response.data;
};

// Development utility to clear all browser storage
export const clearAllStorage = () => {
  // Clear localStorage
  localStorage.clear();
  // Clear sessionStorage
  sessionStorage.clear();
  // Clear cookies (by setting them to expire in the past)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await axiosInstance.post("/api/my-hotels", hotelFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/my-hotels");
  return response.data;
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const hotelId = hotelFormData.get("hotelId");
  const response = await axiosInstance.put(
    `/api/my-hotels/${hotelId}`,
    hotelFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();

  // Only add destination if it's not empty
  if (searchParams.destination && searchParams.destination.trim() !== "") {
    queryParams.append("destination", searchParams.destination.trim());
  }

  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await axiosInstance.get(`/api/hotels/search?${queryParams}`);
  return response.data;
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/hotels");
  return response.data;
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/hotels/${hotelId}`);
  return response.data;
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await axiosInstance.post(
    `/api/hotels/${hotelId}/bookings/payment-intent`,
    { numberOfNights }
  );
  return response.data;
};

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await axiosInstance.post(
    `/api/hotels/${formData.hotelId}/bookings`,
    formData
  );
  return response.data;
};

export const fetchMyBookings = async (): Promise<HotelWithBookingsType[]> => {
  const response = await axiosInstance.get("/api/my-bookings");
  return response.data;
};

export const fetchHotelBookings = async (
  hotelId: string
): Promise<BookingType[]> => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

/** Guest / owner / admin cancel — may trigger Stripe full refund when paid */
export const cancelBooking = async (
  bookingId: string,
  payload?: { cancellationReason?: string }
): Promise<{
  booking: BookingType;
  refundAmount: number;
  refundSkipped?: string;
}> => {
  const response = await axiosInstance.post(
    `/api/bookings/${bookingId}/cancel`,
    payload || {}
  );
  return response.data;
};

/** Public list of reviews for a hotel */
export const fetchHotelReviews = async (hotelId: string) => {
  const response = await axiosInstance.get(`/api/reviews/hotel/${hotelId}`);
  return response.data;
};

/** Create review (JWT) — invalidates hotel/review queries in callers */
export const createHotelReview = async (payload: {
  hotelId: string;
  bookingId: string;
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
}) => {
  const response = await axiosInstance.post("/api/reviews", payload);
  return response.data;
};

// Business Insights API functions (public endpoints - no auth required)
export const fetchBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard/public");
  return response.data;
};

/** Admin: JWT-gated dashboard (same payload as public) */
export const fetchAdminBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard");
  return response.data;
};

export const fetchBusinessInsightsForecast = async () => {
  const response = await axiosInstance.get("/api/business-insights/forecast/public");
  return response.data;
};

/** Public/auth ops figures (system-stats) — avoids /performance in the URL */
export const fetchBusinessInsightsSystemStats = async () => {
  const response = await axiosInstance.get("/api/business-insights/system-stats/public");
  return response.data;
};

/** @deprecated Prefer fetchBusinessInsightsSystemStats */
export const fetchBusinessInsightsPerformance = fetchBusinessInsightsSystemStats;

/** Admin: all users */
export const fetchAdminUsers = async (): Promise<UserType[]> => {
  const response = await axiosInstance.get("/api/users");
  return response.data;
};

/** Admin: PATCH user role */
export const updateUserRole = async (
  userId: string,
  role: "user" | "admin" | "hotel_owner"
): Promise<UserType> => {
  const response = await axiosInstance.patch(`/api/users/${userId}/role`, {
    role,
  });
  return response.data;
};

/** Admin: toggle hotel isActive */
export const updateHotelActive = async (
  hotelId: string,
  isActive: boolean
): Promise<HotelType> => {
  const response = await axiosInstance.patch(`/api/hotels/${hotelId}/active`, {
    isActive,
  });
  return response.data;
};

/** Owner: toggle own hotel isActive (PATCH /api/my-hotels/:id/active) */
export const updateMyHotelActive = async (
  hotelId: string,
  isActive: boolean
): Promise<HotelType> => {
  const response = await axiosInstance.patch(
    `/api/my-hotels/${hotelId}/active`,
    { isActive }
  );
  return response.data;
};

/** Admin: all bookings */
export const fetchAdminBookings = async (): Promise<BookingType[]> => {
  const response = await axiosInstance.get("/api/bookings");
  return response.data;
};

/** Admin: global reviews */
export const fetchAdminReviews = async (): Promise<ReviewType[]> => {
  const response = await axiosInstance.get("/api/reviews");
  return response.data;
};

export type BusinessInsightsRollup = {
  _id: string;
  date: string | Date;
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    totalUsers: number;
    totalHotels: number;
    averageBookingValue: number;
    conversionRate: number;
    cancellationRate: number;
    averageRating: number;
  };
};

/** @deprecated Prefer BusinessInsightsRollup */
export type AnalyticsSnapshot = BusinessInsightsRollup;

/** Admin: list business-insights rollups (blocker-safe; not under /analytics) */
export const fetchBusinessInsightsRollups = async (): Promise<
  BusinessInsightsRollup[]
> => {
  const response = await axiosInstance.get("/api/business-insights/rollups");
  return response.data;
};

/** Admin: capture a live rollup */
export const createBusinessInsightsRollup = async (): Promise<BusinessInsightsRollup> => {
  const response = await axiosInstance.post("/api/business-insights/rollups");
  return response.data;
};

/** @deprecated Prefer fetchBusinessInsightsRollups */
export const fetchAnalyticsSnapshots = fetchBusinessInsightsRollups;

/** @deprecated Prefer createBusinessInsightsRollup */
export const createAnalyticsSnapshot = createBusinessInsightsRollup;

/**
 * AI draft assist — returns text only; caller must Apply (never auto-save).
 * 503 when AI_ASSIST_ENABLED is not true on the server.
 */
export const suggestAiAssist = async (payload: {
  kind: "hotel_description" | "insights_copy";
  input: string;
  context?: Record<string, unknown>;
}): Promise<{
  draft: string;
  provider: "groq" | "openai" | "openrouter" | "stub";
  model?: string;
  usedFallback?: boolean;
  warning?: string;
}> => {
  const response = await axiosInstance.post("/api/ai/suggest", payload);
  return response.data;
};
