import {
  useCallback,
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";
import { cn } from "../../lib/utils";

/** Default when remote CDN/Cloudinary URL fails — keeps layout from showing a broken icon */
const DEFAULT_FALLBACK = "/vite.svg";

export type SafeImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "onError"
> & {
  src?: string | null;
  alt: string;
  /** Absolute fill of a positioned parent (parent must be relative + sized) */
  fill?: boolean;
  /** Prefer eager load for above-the-fold heroes */
  priority?: boolean;
  /** Shown once after primary src errors */
  fallbackSrc?: string;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
};

/**
 * Vite SPA SafeImage — native <img> with one-shot fallback on error.
 * (Next.js SafeImage uses next/image first; this stack has no image optimizer.)
 */
export function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = typeof src === "string" && src.trim() ? src.trim() : "";
  const displaySrc = failed || !resolvedSrc ? fallbackSrc : resolvedSrc;
  const eager = Boolean(priority || loading === "eager");

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      onError?.(e);
      // Switch to fallback once — avoids infinite error loops if fallback also fails
      if (!failed) setFailed(true);
    },
    [onError, failed]
  );

  return (
    <img
      {...rest}
      alt={alt}
      src={displaySrc}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={eager ? "eager" : loading ?? "lazy"}
      decoding="async"
      onError={handleError}
      className={cn(
        fill && "absolute inset-0 h-full w-full",
        className
      )}
    />
  );
}

export default SafeImage;
