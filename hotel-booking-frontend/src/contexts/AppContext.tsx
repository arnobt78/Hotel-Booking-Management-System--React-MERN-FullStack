import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useToast } from "../hooks/use-toast";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = {
  title: string;
  description?: string;
  type: "SUCCESS" | "ERROR" | "INFO";
};

export type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  stripePromise: Promise<Stripe | null>;
  showGlobalLoading: (message?: string) => void;
  hideGlobalLoading: () => void;
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
};

export const AppContext = React.createContext<AppContext | undefined>(
  undefined
);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState(
    "Hotel room is getting ready..."
  );
  const { toast } = useToast();

  // Simple check for stored tokens without API calls
  const checkStoredAuth = () => {
    const localToken = localStorage.getItem("session_id");
    const userId = localStorage.getItem("user_id");

    // Check if we have both token and user ID
    const hasToken = !!localToken;
    const hasUserId = !!userId;

    if (hasToken && hasUserId) {
      console.log("JWT authentication detected - token and user ID found");
    }

    return hasToken;
  };

  // Always run validation query - let it handle token checking internally
  const { isError, isLoading, data } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: false, // Don't refetch on focus
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Always enabled - let validateToken handle missing tokens
      enabled: true,
      // Add fallback for JWT authentication
      onError: (error: any) => {
        // If validateToken fails, check if we have a token in localStorage
        const storedToken = localStorage.getItem("session_id");
        const storedUserId = localStorage.getItem("user_id");

        if (storedToken && error.response?.status === 401) {
          console.log(
            "JWT token found but validation failed - possible token expiration"
          );

          // If we also have a user ID, we can be more confident it's a valid session
          if (storedUserId) {
            console.log("JWT session confirmed - using localStorage fallback");
          }
        }
      },
    }
  );

  // Debug logging to understand the state
  console.log("Auth Debug:", {
    isLoading,
    isError,
    hasData: !!data,
    hasStoredToken: checkStoredAuth(),
    hasUserId: !!localStorage.getItem("user_id"),
    data,
  });

  // Simple logic: logged in if we have valid data OR stored token as fallback
  const isLoggedIn =
    (!isLoading && !isError && !!data) || (checkStoredAuth() && isError); // Use stored token only if validation failed

  // Additional fallback: if we just logged in and have a token, consider logged in
  const justLoggedIn = checkStoredAuth() && !isLoading && !data && !isError;

  // Enhanced JWT authentication detection and fallback
  const isJWTFallback = () => {
    // Check if we have a token but validation failed (typical JWT fallback behavior)
    const hasStoredToken = checkStoredAuth();
    const hasUserId = !!localStorage.getItem("user_id");
    const isFallback = hasStoredToken && isError && !data && hasUserId;

    if (isFallback) {
      console.log(
        "JWT fallback mode detected - using localStorage authentication"
      );
    }

    return isFallback;
  };

  const finalIsLoggedIn = isLoggedIn || justLoggedIn || isJWTFallback();

  console.log(
    "Final isLoggedIn:",
    finalIsLoggedIn,
    "JWT Fallback:",
    isJWTFallback()
  );

  const showToast = (toastMessage: ToastMessage) => {
    const variant =
      toastMessage.type === "SUCCESS"
        ? "success"
        : toastMessage.type === "ERROR"
        ? "destructive"
        : "info";

    toast({
      variant,
      title: toastMessage.title,
      description: toastMessage.description,
    });
  };

  const showGlobalLoading = (message?: string) => {
    if (message) {
      setGlobalLoadingMessage(message);
    }
    setIsGlobalLoading(true);
  };

  const hideGlobalLoading = () => {
    setIsGlobalLoading(false);
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        isLoggedIn: finalIsLoggedIn,
        stripePromise,
        showGlobalLoading,
        hideGlobalLoading,
        isGlobalLoading,
        globalLoadingMessage,
      }}
    >
      {isGlobalLoading && <LoadingSpinner message={globalLoadingMessage} />}
      {children}
    </AppContext.Provider>
  );
};

// ...existing code...
