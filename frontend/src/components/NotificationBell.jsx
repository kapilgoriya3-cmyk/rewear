import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import API_BASE_URL from "../api";

const API = API_BASE_URL;

export default function NotificationBell() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch full list of notifications and unread count
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Periodic polling for notifications
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Poll every 5 seconds for new notifications
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5000);

    // Refresh when user returns to window tab
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Handle clicking a notification
  const handleNotificationClick = async (notif) => {
    // Mark as read in backend
    if (!notif.isRead) {
      try {
        await fetch(`${API}/notifications/${notif._id}/read`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notif._id ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    setIsOpen(false);

    // Navigate to target section (defaults to Incoming Requests tab)
    const target = notif.link || "/profile?tab=incoming";
    navigate(target);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Format relative time helper
  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSecs = Math.floor((now - date) / 1000);
      if (diffSecs < 60) return "Just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  if (!user) return null;

  return (
    <div className="notif-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        id="navbar-notification-bell"
        className="circle notif-bell-btn"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        {/* Sleek bell icon */}
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notif-badge" id="navbar-notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown" id="navbar-notification-dropdown">
          <div className="notif-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>Notifications</strong>
              {unreadCount > 0 && (
                <span className="notif-unread-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="notif-mark-all-btn"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>📭</span>
                <p style={{ margin: 0, fontWeight: 600 }}>No notifications yet</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                  When someone requests a swap for your item, it will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${notif.isRead ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-icon-col">
                    <span className="notif-type-icon">
                      {notif.type === "swap_accepted" ? "✅" : notif.type === "swap_rejected" ? "❌" : "🔄"}
                    </span>
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-item-top">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-time">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-action-hint">Click to view in Requests →</span>
                  </div>
                  {!notif.isRead && <span className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
