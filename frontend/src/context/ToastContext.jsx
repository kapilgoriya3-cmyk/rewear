import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import "../components/Toast.css";

const ToastContext = createContext(null);

let toastCount = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 4000 }) => {
      const id = `toast-${Date.now()}-${++toastCount}`;
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration > 0) {
        timersRef.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // Clean up any remaining timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  // Convenience helper methods
  const success = useCallback(
    (message, options = {}) =>
      addToast({ type: "success", message, ...options }),
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) =>
      addToast({ type: "error", message, ...options }),
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) =>
      addToast({ type: "warning", message, ...options }),
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) =>
      addToast({ type: "info", message, ...options }),
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div
          className="toast-container"
          role="region"
          aria-label="Notifications"
          aria-live="polite"
        >
          {toasts.map((toast) => {
            const isError = toast.type === "error";
            const iconMap = {
              success: "✓",
              error: "✕",
              warning: "⚠️",
              info: "ℹ",
            };

            return (
              <div
                key={toast.id}
                className={`toast-item toast-${toast.type}`}
                role={isError ? "alert" : "status"}
              >
                <span className="toast-icon" aria-hidden="true">
                  {iconMap[toast.type] || "ℹ"}
                </span>

                <div className="toast-content">
                  {toast.title && (
                    <div className="toast-title">{toast.title}</div>
                  )}
                  <p className="toast-message">{toast.message}</p>
                </div>

                <button
                  type="button"
                  className="toast-close-btn"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
