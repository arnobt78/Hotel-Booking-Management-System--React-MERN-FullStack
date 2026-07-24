import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

/**
 * Canonical content shell — keep Header / main / Footer on one vertical edge.
 * max-w-9xl is defined in tailwind.config.js (1700px).
 */
type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const PageContainer = ({
  children,
  className,
  ...props
}: PageContainerProps) => {
  return (
    <div
      className={cn(
        "max-w-9xl mx-auto w-full px-2 sm:px-4 xl:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
