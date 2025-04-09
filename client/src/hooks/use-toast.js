// A simple toast hook

export function useToast() {
  return {
    toast: (options) => {
      console.log("Toast notification:", options);
      // In a real implementation, this would show an actual toast notification
    }
  };
}