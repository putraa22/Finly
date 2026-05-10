"use client";

import * as React from "react";
import { Toast as ToastNamespace } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastNamespace.Provider;
const ToastViewport = ToastNamespace.Viewport;
const ToastRoot = ToastNamespace.Root;
const ToastTitlePrimitive = ToastNamespace.Title;
const ToastDescriptionPrimitive = ToastNamespace.Description;
const ToastClosePrimitive = ToastNamespace.Close;
const ToastActionPrimitive = ToastNamespace.Action;

type ToastRootProps = React.ComponentPropsWithoutRef<typeof ToastRoot>;

export type ToastProps = ToastRootProps & {
  variant?: "default" | "destructive";
};

export type ToastActionElement = React.ReactElement<
  typeof ToastActionPrimitive
>;

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastRoot>,
  ToastProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastRoot
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 pr-9 shadow-[0_14px_40px_rgba(0,0,0,0.14)] transition-all",
        "data-closed:animate-out data-closed:fade-out-80",
        "data-closed:slide-out-to-top-full md:data-closed:slide-out-to-right-full",
        "data-open:animate-in data-open:fade-in-0",
        "data-open:slide-in-from-top-4 md:data-open:slide-in-from-bottom-4",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:transition-none",
        "data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
        variant === "destructive" &&
          "border-destructive/50 bg-destructive text-destructive-foreground",
        className,
      )}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastTitlePrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastTitlePrimitive>
>(({ className, ...props }, ref) => (
  <ToastTitlePrimitive
    ref={ref}
    className={cn("font-heading text-sm font-bold text-foreground", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastDescriptionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastDescriptionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastDescriptionPrimitive
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastActionPrimitive
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent px-3 text-sm font-semibold transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastClosePrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastClosePrimitive>
>(({ className, ...props }, ref) => (
  <ToastClosePrimitive
    ref={ref}
    className={cn(
      "absolute top-2 right-2 rounded-lg p-1 text-foreground/60 opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
    {...props}
  >
    <XIcon className="size-4" />
    <span className="sr-only">Tutup</span>
  </ToastClosePrimitive>
));
ToastClose.displayName = "ToastClose";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
