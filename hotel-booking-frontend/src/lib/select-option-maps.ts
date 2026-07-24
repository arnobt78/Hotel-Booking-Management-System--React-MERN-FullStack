import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

/** Shared sort options — AdvancedSearch + Search page Sort Select */
export const SEARCH_SORT_OPTIONS: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "relevance", label: "Relevance", icon: Sparkles },
  { value: "priceLow", label: "Price: Low to High", icon: ArrowDown },
  { value: "priceHigh", label: "Price: High to Low", icon: ArrowUp },
  { value: "rating", label: "Rating", icon: Star },
  { value: "distance", label: "Distance", icon: MapPin },
];

/** Search results page uses different query param values than AdvancedSearch */
export const SEARCH_PAGE_SORT_OPTIONS: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "default", label: "Sort By", icon: Sparkles },
  { value: "starRating", label: "Star Rating", icon: Star },
  {
    value: "pricePerNightAsc",
    label: "Price Per Night (low to high)",
    icon: ArrowDown,
  },
  {
    value: "pricePerNightDesc",
    label: "Price Per Night (high to low)",
    icon: ArrowUp,
  },
];
