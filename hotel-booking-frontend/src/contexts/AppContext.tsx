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

  const { isError, isLoading, data } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
      // Add fallback for incognito mode
      onError: (error: any) => {
        // If validateToken fails, check if we have a token in localStorage
        const storedToken = localStorage.getItem("session_id");
        if (storedToken && error.response?.status === 401) {
          // We have a token but validateToken failed, this might be incognito mode
          // Don't treat this as an error, let the user continue
          console.log(
            "Token found in localStorage but validateToken failed - possible incognito mode"
          );
        }
      },
    }
  );

  // Only logged in if not loading, not error, and data is present
  // OR if we have a token in localStorage (for incognito mode)
  const hasStoredToken = localStorage.getItem("session_id");
  const isLoggedIn = (!isLoading && !isError && !!data) || !!hasStoredToken;

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
        isLoggedIn,
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
