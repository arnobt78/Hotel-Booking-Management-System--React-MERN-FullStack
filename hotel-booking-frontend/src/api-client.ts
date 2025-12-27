import axiosInstance from "./lib/api-client";
import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
  HotelWithBookingsType,
  BookingType,
} from "../../shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";

// --- AUTH I USER SEKCIJA ---

export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  return response.data;
};

export const signIn = async (formData: SignInFormData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);
  
  return response.data;
};

export const validateToken = async () => {
  const response = await axiosInstance.get("/api/auth/validate-token");
  return response.data;
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  localStorage.removeItem("user_id");
  return response.data;
};

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

// --- MOJI HOTELI (ADMIN/HOST) ---

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

// --- PRETRAGA I JAVNI HOTELI ---

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

  if (searchParams.destination?.trim()) {
    queryParams.append("destination", searchParams.destination.trim());
  }

  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) => queryParams.append("facilities", facility));
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

// --- REZERVACIJE I PLAĆANJE ---

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

export const fetchHotelBookings = async (hotelId: string): Promise<BookingType[]> => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

// --- RECENZIJE I FAVORITI ---

export const fetchReviewsByHotelId = async (hotelId: string) => {
  try {
    const response = await axiosInstance.get(`/api/reviews/${hotelId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return [];
    throw new Error("Failed to fetch reviews");
  }
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
};

export const createReview = async (hotelId: string, payload: CreateReviewPayload) => {
  const response = await axiosInstance.post(`/api/reviews/${hotelId}`, payload);
  return response.data;
};

export const fetchFavorites = async (): Promise<{ hotelId: string }[]> => {
  const response = await axiosInstance.get("/api/favorites");
  return response.data;
};

export const addFavorite = async (hotelId: string) => {
  const response = await axiosInstance.post(`/api/favorites/${hotelId}`, {});
  return response.data;
};

export const removeFavorite = async (hotelId: string) => {
  const response = await axiosInstance.delete(`/api/favorites/${hotelId}`);
  return response.data;
};

// --- ADMIN I INSIGHTS ---

export const fetchAdminDashboard = async () => {
  const response = await axiosInstance.get("/api/admin/dashboard");
  return response.data;
};

export const fetchBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard");
  return response.data;
};

export const fetchBusinessInsightsForecast = async () => {
  const response = await axiosInstance.get("/api/business-insights/forecast");
  return response.data;
};

export const fetchBusinessInsightsPerformance = async () => {
  const response = await axiosInstance.get("/api/business-insights/performance");
  return response.data;
};

// Pomocna funkcija za čišćenje (samo za dev)
export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};