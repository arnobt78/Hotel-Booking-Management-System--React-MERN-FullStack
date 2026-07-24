import { Toaster as Sonner } from "sonner";

/**
 * Global Sonner toaster — mounted once in App.
 * Call sites use AppContext.showToast (title + description + type).
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border shadow-lg font-sans",
          title: "text-sm font-medium",
          description: "text-sm opacity-90",
        },
      }}
    />
  );
}
