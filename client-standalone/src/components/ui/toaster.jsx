import { Toaster as ToastPrimitive } from "./toast";
import { ToastProvider } from "./toast";

export function Toaster() {
  return (
    <ToastProvider>
      <ToastPrimitive />
    </ToastProvider>
  );
}