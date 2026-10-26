import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogoutModal() {
  const navigate = useNavigate();
  const {
    isLogoutModalOpen,
    cancelLogout,
    confirmLogout,
    isLoggingOut,
  } = useAuth();

  // Close modal when user presses the Escape key and prevent background scroll
  useEffect(() => {
    if (!isLogoutModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancelLogout();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLogoutModalOpen, cancelLogout]);

  if (!isLogoutModalOpen) return null;

  const handleConfirm = () => {
    if (isLoggingOut) return;
    confirmLogout(navigate);
  };

  return (
    <div
      className="logout-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(23, 26, 24, 0.72)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={cancelLogout}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-desc"
    >
      <div
        className="logout-modal-content"
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
        {/* Brand Accent Green Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "var(--sage2, #E0EEE5)",
            color: "var(--sage, #176B4D)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Modal Title */}
        <h2
          id="logout-modal-title"
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "var(--ink, #171A18)",
            margin: "0 0 8px",
          }}
        >
          Log out of ReWear?
        </h2>

        {/* Message */}
        <p
          id="logout-modal-desc"
          style={{
            fontSize: "14px",
            color: "var(--muted, #66726B)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to log out of your account?
        </p>

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
            onClick={cancelLogout}
            disabled={isLoggingOut}
            style={{
              flex: 1,
              padding: "11px 18px",
              fontSize: "13.5px",
              borderRadius: "var(--r-md, 14px)",
              cursor: "pointer",
            }}
            id="logout-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn dark"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            style={{
              flex: 1,
              padding: "11px 18px",
              fontSize: "13.5px",
              borderRadius: "var(--r-md, 14px)",
              cursor: isLoggingOut ? "not-allowed" : "pointer",
              opacity: isLoggingOut ? 0.7 : 1,
            }}
            id="logout-confirm-button"
          >
            {isLoggingOut ? "Logging out…" : "Yes, log out"}
          </button>
        </div>
      </div>
    </div>
  );
}
