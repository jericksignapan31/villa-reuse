"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
  formatRelativeTime,
  type Notification,
} from "@/lib/notificationStore";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {
      new_request: 0,
      request_accepted: 0,
      request_rejected: 0,
      transaction_completed: 0,
      item_updated: 0,
      message: 0,
    },
  });

  // Load notifications on mount
  useEffect(() => {
    let loaded = loadNotifications();
    
    // Initialize with demo data if no notifications exist
    if (loaded.length === 0) {
      const { addDemoNotifications } = require("@/lib/notificationStore");
      addDemoNotifications();
      loaded = loadNotifications();
    }

    setNotifications(loaded);

    // Update stats
    const newStats = {
      total: loaded.length,
      unread: loaded.filter((n) => !n.isRead).length,
      byType: {
        new_request: loaded.filter((n) => n.type === "new_request").length,
        request_accepted: loaded.filter((n) => n.type === "request_accepted").length,
        request_rejected: loaded.filter((n) => n.type === "request_rejected").length,
        transaction_completed: loaded.filter((n) => n.type === "transaction_completed").length,
        item_updated: loaded.filter((n) => n.type === "item_updated").length,
        message: loaded.filter((n) => n.type === "message").length,
      },
    };
    setStats(newStats);
    setIsLoaded(true);
  }, []);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // Update stats
    setStats((prev) => ({
      ...prev,
      unread: prev.unread > 0 ? prev.unread - 1 : 0,
    }));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStats((prev) => ({ ...prev, unread: 0 }));
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    const deleted = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Update stats
    if (deleted && !deleted.isRead) {
      setStats((prev) => ({
        ...prev,
        unread: prev.unread > 0 ? prev.unread - 1 : 0,
      }));
    }
    setStats((prev) => ({
      ...prev,
      total: prev.total > 0 ? prev.total - 1 : 0,
    }));
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all notifications? This cannot be undone.")) {
      deleteAllNotifications();
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        byType: {
          new_request: 0,
          request_accepted: 0,
          request_rejected: 0,
          transaction_completed: 0,
          item_updated: 0,
          message: 0,
        },
      });
    }
  };

  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <Link href="/dashboard" className="notifications-back">
          ← Back to Dashboard
        </Link>

        <header className="notifications-header">
          <div className="notifications-title-section">
            <h1>Notifications</h1>
            {stats.unread > 0 && (
              <span className="notifications-badge-header">{stats.unread}</span>
            )}
          </div>
          <p>Stay updated with your requests and transactions.</p>
        </header>

        {/* Stats Cards */}
        <div className="notifications-stats">
          <div className="stats-card">
            <div className="stats-value">{stats.total}</div>
            <div className="stats-label">Total</div>
          </div>
          <div className="stats-card highlight">
            <div className="stats-value">{stats.unread}</div>
            <div className="stats-label">Unread</div>
          </div>
          <div className="stats-card">
            <div className="stats-value">{stats.byType.new_request}</div>
            <div className="stats-label">Requests</div>
          </div>
          <div className="stats-card">
            <div className="stats-value">{stats.byType.request_accepted}</div>
            <div className="stats-label">Accepted</div>
          </div>
        </div>

        {/* Controls */}
        <div className="notifications-controls">
          <div className="notifications-filter">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({stats.unread})
            </button>
          </div>

          <div className="notifications-actions">
            {stats.unread > 0 && (
              <button className="action-btn secondary" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            {stats.total > 0 && (
              <button className="action-btn danger" onClick={handleDeleteAll}>
                Delete all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {isLoaded && filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <h2>No notifications</h2>
              <p>
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.isRead ? "unread" : ""}`}
              >
                <div className="notification-icon">{notification.icon}</div>

                <div className="notification-content">
                  <h3 className="notification-title">{notification.title}</h3>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="action-delete"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
