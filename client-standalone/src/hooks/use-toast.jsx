import { useToastContext } from "../components/ui/toast";

export function useToast() {
  const { toasts, setToasts } = useToastContext();

  function toast({ title, description, variant, duration = 5000 }) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    return {
      id,
      dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
      update: (props) => {
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id ? { ...toast, ...props } : toast
          )
        );
      },
    };
  }

  return {
    toast,
    toasts,
    dismiss: (toastId) => setToasts((toasts) => toasts.filter((toast) => toast.id !== toastId)),
  };
}