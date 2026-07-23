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

/** Clear stale JWT keys so UI does not look logged-in after 401 */
const clearAuthStorage = () => {
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_image");
};

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

  const hasStoredToken =
    typeof window !== "undefined" && !!localStorage.getItem("session_id");

  // Guests: skip validate-token (avoids expected 401 noise in prod console)
  const { isError, isLoading, data } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      enabled: hasStoredToken,
      onError: () => {
        // Stale/expired JWT — clear storage so isLoggedIn stays false
        clearAuthStorage();
      },
    }
  );

  // Logged in only when validate-token succeeds (or brief post-login race with token)
  const isLoggedIn =
    (!isLoading && !isError && !!data) ||
    (hasStoredToken && !isLoading && !isError && !data);

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
