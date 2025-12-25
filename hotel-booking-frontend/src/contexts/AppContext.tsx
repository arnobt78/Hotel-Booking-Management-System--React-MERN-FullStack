import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useToast } from "../hooks/use-toast";
import type { UserType } from "../../../shared/types";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = {
  title: string;
  description?: string;
  type: "SUCCESS" | "ERROR" | "INFO";
};

export type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  user: UserType | null;
  stripePromise: Promise<Stripe | null>;
  showGlobalLoading: (message?: string) => void;
  hideGlobalLoading: () => void;
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
};

export const AppContext = React.createContext<AppContext | undefined>(undefined);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState(
    "Hotel room is getting ready..."
  );
  const [user, setUser] = useState<UserType | null>(null);

  const { toast } = useToast();

  const checkStoredAuth = () => {
    const localToken = localStorage.getItem("session_id");
    const userId = localStorage.getItem("user_id");
    const hasToken = !!localToken;
    const hasUserId = !!userId;

    if (hasToken && hasUserId) {
      console.log("JWT authentication detected - token and user ID found");
    }

    return hasToken;
  };

  const { isError, isLoading, data } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      enabled: true,
      onError: (error: any) => {
        const storedToken = localStorage.getItem("session_id");
        const storedUserId = localStorage.getItem("user_id");

        if (storedToken && error.response?.status === 401) {
          console.log(
            "JWT token found but validation failed - possible token expiration"
          );
          if (storedUserId) {
            console.log("JWT session confirmed - using localStorage fallback");
          }
        }
      },
    }
  );

  const isLoggedIn =
    (!isLoading && !isError && !!data) || (checkStoredAuth() && isError);

  const justLoggedIn = checkStoredAuth() && !isLoading && !data && !isError;

  const isJWTFallback = () => {
    const hasStoredToken = checkStoredAuth();
    const hasUserId = !!localStorage.getItem("user_id");
    const isFallback = hasStoredToken && isError && !data && hasUserId;

    if (isFallback) {
      console.log("JWT fallback mode detected - using localStorage authentication");
    }

    return isFallback;
  };

  const finalIsLoggedIn = isLoggedIn || justLoggedIn || isJWTFallback();

  useEffect(() => {
    const loadUser = async () => {
      if (!finalIsLoggedIn) {
        setUser(null);
        return;
      }

      try {
        const me = await apiClient.fetchCurrentUser();
        setUser(me);
      } catch (e) {
        console.log("Failed to fetch current user:", e);
        setUser(null);
      }
    };

    loadUser();
  }, [finalIsLoggedIn]);

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
    if (message) setGlobalLoadingMessage(message);
    setIsGlobalLoading(true);
  };

  const hideGlobalLoading = () => setIsGlobalLoading(false);

  const value = useMemo(
    () => ({
      showToast,
      isLoggedIn: finalIsLoggedIn,
      user, 
      stripePromise,
      showGlobalLoading,
      hideGlobalLoading,
      isGlobalLoading,
      globalLoadingMessage,
    }),
    [finalIsLoggedIn, user, isGlobalLoading, globalLoadingMessage]
  );

  return (
    <AppContext.Provider value={value}>
      {isGlobalLoading && <LoadingSpinner message={globalLoadingMessage} />}
      {children}
    </AppContext.Provider>
  );
};