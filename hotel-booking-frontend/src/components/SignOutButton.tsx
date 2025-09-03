import { useQueryClient } from "react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-50 hover:shadow-medium transition-all duration-200 group">
          <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Sign Out
          <ChevronDown className="w-4 h-4 ml-1 group-hover:scale-110 transition-transform" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end">
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
