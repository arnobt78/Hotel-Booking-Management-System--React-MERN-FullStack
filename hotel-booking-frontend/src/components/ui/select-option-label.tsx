import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type SelectOptionLabelProps = {
  icon: LucideIcon;
  children: ReactNode;
  /** Override default primary icon color (e.g. amber stars) */
  iconClassName?: string;
  className?: string;
};

/**
 * Consistent icon + label row for SelectItem children.
 * Wrapped by SelectPrimitive.ItemText, so the closed trigger also shows icon + text.
 */
export function SelectOptionLabel({
  icon: Icon,
  children,
  iconClassName,
  className,
}: SelectOptionLabelProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2 leading-none", className)}>
      <Icon
        className={cn("h-4 w-4 shrink-0 text-primary-600", iconClassName)}
        aria-hidden
      />
      <span className="truncate leading-none text-gray-700">{children}</span>
    </span>
  );
}
