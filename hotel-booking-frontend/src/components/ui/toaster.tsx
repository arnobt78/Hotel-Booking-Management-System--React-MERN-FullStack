import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "../../hooks/use-toast";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {props.variant === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {props.variant === "destructive" && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                {props.variant === "info" && (
                  <Info className="h-5 w-5 text-blue-600" />
                )}
                {!props.variant && <Info className="h-5 w-5 text-gray-600" />}
              </div>
              <div className="flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
