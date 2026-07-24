import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { InsightsCardHeader } from "./InsightsCardHeader";

export type MetricTone = "neutral" | "positive" | "negative" | "warning";

type MetricStatCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value: ReactNode;
  tone?: MetricTone;
  iconClassName?: string;
  footer?: ReactNode;
  className?: string;
};

const valueToneClass: Record<MetricTone, string> = {
  neutral: "text-gray-700",
  positive: "text-green-600",
  negative: "text-red-600",
  warning: "text-amber-600",
};

/** KPI / state card with icon+title+subtitle header and tone-colored value */
export function MetricStatCard({
  icon,
  title,
  subtitle,
  value,
  tone = "neutral",
  iconClassName,
  footer,
  className,
}: MetricStatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-xl border p-6 flex flex-col",
        className,
      )}
    >
      <InsightsCardHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        iconClassName={iconClassName}
        className="mb-3"
      />
      {/* Value right; optional footer (e.g. MoM %) shares the same row on the left */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        {footer ? (
          <div className="shrink-0 min-w-0">{footer}</div>
        ) : (
          <span className="shrink-0" aria-hidden />
        )}
        <p
          className={cn(
            "text-md md:text-lg font-medium leading-none text-right tabular-nums min-w-0",
            valueToneClass[tone],
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/** Map numeric / trend values to MetricTone for consistent coloring */
export function toneFromNumber(
  n: number,
  opts?: { invert?: boolean; zeroNeutral?: boolean },
): MetricTone {
  if (opts?.zeroNeutral !== false && n === 0) return "neutral";
  const positive = opts?.invert ? n < 0 : n > 0;
  const negative = opts?.invert ? n > 0 : n < 0;
  if (positive) return "positive";
  if (negative) return "negative";
  return "neutral";
}

export function toneFromTrend(trend: string): MetricTone {
  const t = trend.toLowerCase();
  if (t.includes("increas") || t.includes("up")) return "positive";
  if (t.includes("decreas") || t.includes("down")) return "negative";
  return "neutral";
}
