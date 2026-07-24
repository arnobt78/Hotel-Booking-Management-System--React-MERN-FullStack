import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

/** Icon + title (+ optional subtitle) for filter / form sections */
type FilterSectionLabelProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
};

const FilterSectionLabel = ({
  icon: Icon,
  title,
  subtitle,
  className,
}: FilterSectionLabelProps) => {
  return (
    <div className={cn("flex items-start gap-2 mb-2", className)}>
      <Icon className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700 leading-tight">
          {title}
        </p>
        {subtitle ? (
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};

export default FilterSectionLabel;
