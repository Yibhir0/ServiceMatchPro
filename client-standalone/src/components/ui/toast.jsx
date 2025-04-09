import * as React from "react";
import { cn } from "../../lib/utils";

const ToastContext = React.createContext({});

function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

function ToastProvider({ children, ...props }) {
  const [toasts, setToasts] = React.useState([]);

  return (
    <ToastContext.Provider value={{ toasts, setToasts }} {...props}>
      {children}
    </ToastContext.Provider>
  );
}

function Toast({ className, title, description, variant = "default", ...props }) {
  const variantStyles = {
    default: "bg-background border",
    destructive: "group destructive border-destructive bg-destructive text-destructive-foreground",
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
    </div>
  );
}

function Toaster() {
  const { toasts } = useToastContext();

  return (
    <div className="fixed top-0 z-[100] flex flex-col gap-2 px-4 py-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse sm:items-end sm:justify-start">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

export { ToastProvider, Toast, Toaster, useToastContext };