import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { SearchContextProvider } from "./contexts/SearchContext.tsx";
import { installScrollLockGapFix } from "./lib/scroll-lock-fix";

// Neutralize RemoveScroll + scrollbar-gutter double gap (Select/Dialog)
installScrollLockGapFix();

/**
 * SPA data cache: modest staleTime cuts duplicate GETs on rapid nav;
 * refetch on focus/reconnect covers back-button / tab return.
 * Mutations must still call invalidate-* helpers for instant CRUD UI.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
