import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import useAppContext from "../hooks/useAppContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const error = searchParams.get("error");
    const email = searchParams.get("email");
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const image = searchParams.get("image");

    if (error) {
      showToast({
        title: "Sign-in failed",
        description:
          error === "oauth_config"
            ? "Google sign-in is not configured."
            : error === "token_exchange"
            ? "Could not complete Google sign-in."
            : "Something went wrong. Please try again.",
        type: "ERROR",
      });
      navigate("/sign-in");
      return;
    }

    if (token && userId) {
      localStorage.setItem("session_id", token);
      localStorage.setItem("user_id", userId);
      if (email) localStorage.setItem("user_email", email);
      const name = [firstName, lastName].filter(Boolean).join(" ") || email;
      if (name) localStorage.setItem("user_name", name);
      if (image) localStorage.setItem("user_image", image);

      queryClient.invalidateQueries("validateToken");
      showToast({
        title: "Signed in successfully",
        description: "Welcome! You have been signed in with Google.",
        type: "SUCCESS",
      });
      navigate("/");
      window.location.reload();
    } else {
      navigate("/sign-in");
    }
  }, [searchParams, navigate, queryClient, showToast]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
