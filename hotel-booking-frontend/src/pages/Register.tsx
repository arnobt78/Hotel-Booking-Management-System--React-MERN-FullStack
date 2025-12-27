import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutationWithLoading(apiClient.register, {
    onSuccess: async () => {
      showToast({ 
        title: "Registration Successful", 
        description: "Your account has been created successfully! Welcome to BookInn.",
        type: "SUCCESS" 
      });
      await queryClient.invalidateQueries("validateToken");
      navigate("/");
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const data = error?.response?.data;

      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors[0]?.msg : null) ||
        error?.message ||
        "Something went wrong";

      const emailTaken =
        status === 409 ||
        data?.field === "email" ||
        (typeof msg === "string" && msg.toLowerCase().includes("email"));

      if (emailTaken) {
        setError("email", { type: "manual", message: msg });

        showToast({
          title: "Registration Failed",
          description: msg,
          type: "ERROR",
        });
        return;
      }

      showToast({
        title: "Registration Failed",
        description: msg,
        type: "ERROR",
      });
    },

    loadingMessage: "Creating your account...",
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    mutation.mutate(data, {
      onSettled: () => setIsLoading(false),
    });
  });

  const password = watch("password");

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Modern Card Container */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-200 rounded-full opacity-30"></div>

          {/* Header */}
          <CardHeader className="text-center relative z-10 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Join BookInn
            </CardTitle>
            <CardDescription className="text-gray-600">
              Create your account to start booking
            </CardDescription>

          </CardHeader>

          {/* Form */}
          <CardContent className="space-y-6">
            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <Input
                      id="firstName"
                      type="text"
                      className="pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter first name"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className="text-red-500 border-red-200 bg-red-50"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {errors.firstName.message}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <Input
                      id="lastName"
                      type="text"
                      className="pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter last name"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                  </div>
                  {errors.lastName && (
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className="text-red-500 border-red-200 bg-red-50"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {errors.lastName.message}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-6 w-6 text-gray-600" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your email"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1">
                    <Badge
                      variant="outline"
                      className="text-red-500 border-red-200 bg-red-50"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-6 w-6 text-gray-600" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-12 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Create a password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 pr-3 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-1">
                    <Badge
                      variant="outline"
                      className="text-red-500 border-red-200 bg-red-50"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {errors.password.message}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-6 w-6 text-gray-600" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-12 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    {...register("confirmPassword", {
                      validate: (val) => {
                        if (!val) {
                          return "Please confirm your password";
                        } else if (password !== val) {
                          return "Passwords do not match";
                        }
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 pr-3 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1">
                    <Badge
                      variant="outline"
                      className="text-red-500 border-red-200 bg-red-50"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {errors.confirmPassword.message}
                    </Badge>
                  </div>
                )}
                {password &&
                  !errors.confirmPassword &&
                  watch("confirmPassword") === password && (
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className="text-green-500 border-green-200 bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passwords match
                      </Badge>
                    </div>
                  )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-gray-300" />
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/sign-in"
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 underline decoration-2 underline-offset-2"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
