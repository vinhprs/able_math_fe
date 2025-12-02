/**
 * Simple toast notification utility
 * Uses browser's native alert for now, can be replaced with a proper toast library later
 */

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  duration?: number;
}

const toastQueue: Array<{ message: string; type: ToastType; id: number }> = [];
let toastId = 0;

/**
 * Show a toast notification
 */
export function toast(
  message: string,
  type: ToastType = "info",
  options?: ToastOptions
) {
  const id = toastId++;
  const toastItem = { message, type, id };

  toastQueue.push(toastItem);

  // Create toast element
  const toastElement = document.createElement("div");
  toastElement.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-md transition-all transform translate-x-0 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : type === "warning"
      ? "bg-yellow-500 text-white"
      : "bg-blue-500 text-white"
  }`;
  toastElement.textContent = message;
  toastElement.style.transform = "translateX(400px)";
  toastElement.style.opacity = "0";

  document.body.appendChild(toastElement);

  // Animate in
  setTimeout(() => {
    toastElement.style.transition = "all 0.3s ease-out";
    toastElement.style.transform = "translateX(0)";
    toastElement.style.opacity = "1";
  }, 10);

  // Remove after duration
  const duration = options?.duration || 3000;
  setTimeout(() => {
    toastElement.style.transform = "translateX(400px)";
    toastElement.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toastElement);
      const index = toastQueue.findIndex((t) => t.id === id);
      if (index > -1) {
        toastQueue.splice(index, 1);
      }
    }, 300);
  }, duration);
}

/**
 * Success toast
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  toast(message, "success", options);
}

/**
 * Error toast
 */
export function toastError(message: string, options?: ToastOptions) {
  toast(message, "error", { duration: 5000, ...options });
}

/**
 * Info toast
 */
export function toastInfo(message: string, options?: ToastOptions) {
  toast(message, "info", options);
}

/**
 * Warning toast
 */
export function toastWarning(message: string, options?: ToastOptions) {
  toast(message, "warning", options);
}
