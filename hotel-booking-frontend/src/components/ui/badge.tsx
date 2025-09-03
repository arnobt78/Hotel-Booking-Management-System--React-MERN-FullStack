import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variantClasses = {
    default: "bg-primary-100 text-primary-800",
    outline: "border border-gray-300 text-gray-700 bg-white",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export { Badge };
