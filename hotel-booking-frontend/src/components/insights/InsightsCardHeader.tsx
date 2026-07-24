import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type InsightsCardHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Tailwind tint classes for icon well, e.g. bg-blue-100 text-blue-600 */
  iconClassName?: string;
  className?: string;
};

/**
 * Card header: icon well stretches to title+subtitle height; used across Insights cards.
 */
export function InsightsCardHeader({
  icon: Icon,
  title,
  subtitle,
  iconClassName = "bg-primary-100 text-primary-600",
  className,
}: InsightsCardHeaderProps) {
  return (
    <div className={cn("flex items-stretch gap-3 mb-4", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl px-3",
          iconClassName,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <h3 className="text-md md:text-lg font-medium text-gray-700 leading-tight">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-sm font-normal text-gray-500 ">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
