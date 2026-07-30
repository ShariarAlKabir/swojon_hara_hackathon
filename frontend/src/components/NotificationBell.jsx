import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;

    function loadNotifications() {
      api.get("/notifications")
        .then((res) => {
          if (isCurrent) setNotifications(res.data || []);
        })
        .catch((err) => {
          if (err.response?.status !== 401) console.error(err);
        });
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  async function toggleNotifications(event) {
    event.stopPropagation();
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      try {
        await api.patch("/notifications/read");
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="notification-menu" ref={dropdownRef}>
      <button
        className="notification-button"
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        onClick={toggleNotifications}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22a2.55 2.55 0 0 0 2.45-1.85h-4.9A2.55 2.55 0 0 0 12 22Zm7.1-5.15-1.35-1.55V10a5.82 5.82 0 0 0-4.5-5.68V3.5a1.25 1.25 0 0 0-2.5 0v.82A5.82 5.82 0 0 0 6.25 10v5.3L4.9 16.85A1.3 1.3 0 0 0 5.88 19h12.24a1.3 1.3 0 0 0 .98-2.15Z" />
        </svg>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown" onClick={(event) => event.stopPropagation()}>
          <div className="notification-heading">
            <strong>Notifications</strong>
            <span>{notifications.length} total</span>
          </div>
          <div className="notification-list">
            {notifications.length ? notifications.map((notification) => (
              <Link
                className={`notification-item ${notification.is_read ? "" : "unread"}`}
                key={notification.id}
                to={notification.report_id ? `/reports/${notification.report_id}` : "/profile"}
                onClick={() => setIsOpen(false)}
              >
                <span className="notification-item-icon" aria-hidden="true">✓</span>
                <span>
                  <strong>{notification.message}</strong>
                  {notification.description && <small>{notification.description}</small>}
                  <time>{formatNotificationTime(notification.created_at)}</time>
                </span>
              </Link>
            )) : (
              <div className="notification-empty">No notifications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatNotificationTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
