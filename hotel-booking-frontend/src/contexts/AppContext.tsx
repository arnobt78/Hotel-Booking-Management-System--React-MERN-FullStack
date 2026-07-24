import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { toast as sonnerToast } from "sonner";
import type { ToastPayload } from "../lib/toast-messages";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = ToastPayload;

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
  const hasStoredToken =
    typeof window !== "undefined" && !!localStorage.getItem("session_id");

  // Guests: skip validate-token (avoids expected 401 noise in prod console)
  const { isError, data } = useQuery(
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

  // Optimistic nav chrome: JWT in localStorage → show profile until validate fails
  // (avoids Log In flash on refresh while validateToken is loading)
  const isLoggedIn = hasStoredToken ? !isError : Boolean(data) && !isError;

  /** Central toast API — Sonner; all CRUD/auth mutations use this */
  const showToast = (toastMessage: ToastMessage) => {
    const opts = {
      description: toastMessage.description,
    };
    if (toastMessage.type === "SUCCESS") {
      sonnerToast.success(toastMessage.title, opts);
    } else if (toastMessage.type === "ERROR") {
      sonnerToast.error(toastMessage.title, opts);
    } else {
      sonnerToast.message(toastMessage.title, opts);
    }
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
