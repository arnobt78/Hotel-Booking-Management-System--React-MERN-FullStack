import React from "react";
import { Loader2, Hotel } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showHotelIcon?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Hotel room is getting ready...",
  size = "md",
  showHotelIcon = true,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
            {showHotelIcon && (
              <Hotel className="absolute inset-0 m-auto w-4 h-4 text-primary-500 animate-pulse" />
            )}
          </div>
          
          {/* Message */}
          <div className="space-y-2">
            <h3 className={`font-semibold text-gray-900 ${textSizes[size]}`}>
              {message}
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we prepare everything for you...
            </p>
          </div>
          
          {/* Decorative dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
