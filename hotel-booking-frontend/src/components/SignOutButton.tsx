import { useQueryClient } from "react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Google profile image if exists, otherwise Robohash avatar
const getAvatarUrl = () => {
  const image = localStorage.getItem("user_image");
  if (image) return image; // Google Gmail profile image
  const email = localStorage.getItem("user_email");
  const name = localStorage.getItem("user_name");
  const identifier = email || name || "user";
  return `https://robohash.org/${encodeURIComponent(identifier)}.png?size=80x80&set=set1`;
};

const SignOutButton = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const mutation = useMutationWithLoading(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("validateToken");
      showToast({
        title: "Successfully Signed Out",
        description:
          "You have been logged out of your account. Redirecting to sign-in page...",
        type: "SUCCESS",
      });
      navigate("/sign-in");
      window.location.reload();
    },
    onError: (error: Error) => {
      showToast({
        title: "Sign Out Failed",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Signing out...",
  });

  const clearAuthMutation = useMutationWithLoading(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("validateToken");
      showToast({
        title: "Auth State Cleared",
        description:
          "Authentication state has been cleared. Redirecting to sign-in page...",
        type: "SUCCESS",
      });
      navigate("/sign-in");
      window.location.reload();
    },
    onError: (error: Error) => {
      showToast({
        title: "Clear Auth Failed",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Clearing auth state...",
  });

  const clearAllStorage = () => {
    apiClient.clearAllStorage();
    showToast({
      title: "Storage Cleared",
      description:
        "All browser storage (localStorage, sessionStorage, cookies) has been cleared. Page will reload...",
      type: "SUCCESS",
    });
    window.location.reload();
  };

  const handleSignOut = () => {
    mutation.mutate(undefined);
  };

  const handleClearAuth = () => {
    clearAuthMutation.mutate(undefined);
  };

  const userEmail = localStorage.getItem("user_email");
  const userName = localStorage.getItem("user_name");
  const displayName = userName || userEmail || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full p-0.5 ring-2 ring-teal-400/80 hover:ring-teal-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
          aria-label="Profile menu"
        >
          <img
            src={getAvatarUrl()}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://robohash.org/${encodeURIComponent(displayName)}.png?size=80x80&set=set1`;
            }}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end">
        <DropdownMenuLabel>
          <p className="font-medium text-gray-900">{displayName}</p>
          {userEmail && (
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-primary-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>

        {/* Development utilities - only show in development */}
        {!import.meta.env.PROD && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClearAuth}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Auth State
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={clearAllStorage}
              className="text-orange-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Storage
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignOutButton;
