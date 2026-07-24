import * as React from "react";
import { cn } from "../../lib/utils";

const STAGGER_MS = 70;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type StaggerScopeProps = {
  /** Remount key — change on route / login / logout to replay animation */
  resetKey: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Remounts children when resetKey changes so stagger-in runs again.
 */
export function StaggerScope({
  resetKey,
  className,
  children,
}: StaggerScopeProps) {
  return (
    <div key={resetKey} className={cn(className)}>
      {children}
    </div>
  );
}

type StaggerItemProps = {
  index: number;
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "header" | "footer" | "span";
};

/**
 * Stair-step fade/slide-in. Delay = index * 70ms; skipped when reduced motion.
 */
export function StaggerItem({
  index,
  className,
  children,
  as: Tag = "div",
}: StaggerItemProps) {
  const reduce = prefersReducedMotion();

  return (
    <Tag
      className={cn(
        reduce ? "opacity-100" : "animate-stagger-in opacity-0",
        className,
      )}
      style={
        reduce
          ? undefined
          : {
              animationDelay: `${index * STAGGER_MS}ms`,
              animationFillMode: "forwards",
            }
      }
    >
      {children}
    </Tag>
  );
}
