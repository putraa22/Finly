"use client";

import { useToast } from "@/src/lib/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={4500} swipeDirection="right" label="Notifikasi">
      {toasts.map(
        ({ id, title, description, action, variant, ...props }) => (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid min-w-0 flex-1 gap-1">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? (
                <ToastDescription>{description}</ToastDescription>
              ) : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ),
      )}
      <ToastViewport
        className={cn(
          "fixed z-100 flex max-h-screen w-full flex-col gap-2",
          /* Mobile: mengambang di atas (aman untuk notch / safe area) */
          "inset-x-0 top-0 bottom-auto p-4 pt-[max(1rem,env(safe-area-inset-top,0px))]",
          /* md+: pojok kanan bawah seperti desktop */
          "md:inset-x-auto md:top-auto md:right-0 md:bottom-0 md:left-auto md:max-w-sm md:p-4",
        )}
      />
    </ToastProvider>
  );
}
