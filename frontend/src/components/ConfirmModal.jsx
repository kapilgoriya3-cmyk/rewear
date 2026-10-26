import { useEffect, useRef } from "react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  type = isDestructive ? "danger" : "info",
  isLoading = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) {
  const confirmBtnRef = useRef(null);

  // Close modal on Escape key and prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Auto-focus confirm button on open
  useEffect(() => {
    if (isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  const handleConfirmClick = () => {
    if (isLoading) return;
    onConfirm?.();
  };

  // Determine icon & styling based on modal type
  const isDanger = isDestructive || type === "danger";
  const isWarning = type === "warning";

  const iconBg = isDanger
    ? "var(--rose-bg, #FEE2E2)"
    : isWarning
    ? "var(--amber-bg, #FEF3C7)"
    : "var(--sage2, #E0EEE5)";

  const iconColor = isDanger
    ? "var(--rose, #991B1B)"
    : isWarning
    ? "var(--amber, #B45309)"
    : "var(--sage, #176B4D)";

  return (
    <div
      className="confirm-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(23, 26, 24, 0.72)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
        padding: "20px",
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div
        className="confirm-modal-content"
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: "var(--white, #ffffff)",
          borderRadius: "var(--r-xl, 24px)",
          border: "1px solid var(--line, #E7E5DF)",
          boxShadow: "var(--shadow-lg, 0 20px 50px rgba(23, 26, 24, 0.14))",
          padding: "32px 28px 24px",
          position: "relative",
          textAlign: "center",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: iconBg,
            color: iconColor,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          {isDanger ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          ) : isWarning ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>

        {/* Modal Title */}
        <h2
          id="confirm-modal-title"
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "var(--ink, #171A18)",
            margin: "0 0 8px",
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <div
          id="confirm-modal-desc"
          style={{
            fontSize: "14px",
            color: "var(--muted, #66726B)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {typeof message === "string" ? <p style={{ margin: 0 }}>{message}</p> : message}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "stretch",
          }}
        >
          <button
            type="button"
            className="btn light"
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "11px 18px",
              fontSize: "13.5px",
              borderRadius: "var(--r-md, 14px)",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            className={isDanger ? "btn" : "btn dark"}
            onClick={handleConfirmClick}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "11px 18px",
              fontSize: "13.5px",
              borderRadius: "var(--r-md, 14px)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              backgroundColor: isDanger ? "var(--rose, #991B1B)" : undefined,
              color: isDanger ? "#ffffff" : undefined,
              border: isDanger ? "none" : undefined,
            }}
          >
            {isLoading ? "Please wait…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
