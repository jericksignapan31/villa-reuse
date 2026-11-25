
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getUnreadCount } from "@/lib/notificationStore";
import { logoutUser } from "@/lib/authStore";
import LogoutModal from "./LogoutModal";

const myListings = [
  {
    name: "A little collection of good reads",
    category: "Books & School",
    type: "Donation",
    status: "Available",
    emoji: "📚",
    color: "book",
  },
  {
    name: "Wooden bedside table",
    category: "Furniture",
    type: "Exchange",
    status: "Reserved",
    emoji: "🪑",
    color: "furniture",
  },
  {
    name: "Everyday tote bag",
    category: "Clothing",
    type: "Donation",
    status: "Completed",
    emoji: "👜",
    color: "clothing",
  },
];

const activities = [
  {
    icon: "♡",
    title: "Donation request received",
    description: "Someone is interested in your books.",
    time: "2 hours ago",
  },
  {
    icon: "↻",
    title: "Item marked as completed",
    description: "Your tote bag found a new home.",
    time: "Yesterday",
  },
  {
    icon: "＋",
    title: "New item listing",
    description: "You shared your bedside table.",
    time: "3 days ago",
  },
];

export default function DashboardPage() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    const count = getUnreadCount();
    setUnreadCount(count);
  }, []);

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link href="/" className="browse-logo dashboard-logo">
          <span className="browse-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>

        <p className="dashboard-menu-label">MENU</p>

        <nav className="dashboard-menu">
          <Link href="/dashboard" className="dashboard-menu-link active">
            <span>▦</span> Overview
          </Link>
          <Link href="/items" className="dashboard-menu-link">
            <span>⌕</span> Browse Items
          </Link>
        <Link href="/my-listings" className="dashboard-menu-link">
  <span>▤</span> My Listings
</Link>
         <Link href="/my-requests" className="dashboard-menu-link">
  <span>⇄</span> My Requests
</Link>
          <Link href="/favorites" className="dashboard-menu-link">
            <span>♡</span> Favorites
          </Link>
          <Link href="/notifications" className="dashboard-menu-link">
            <span>🔔</span> Notifications {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
         <Link href="/settings" className="dashboard-menu-link">
  <span>⚙</span> Settings
</Link>
         <button
  className="dashboard-menu-link"
  onClick={() => setLogoutModalOpen(true)}
>
  <span>↪</span> Log out
</button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">Workspace / Overview</span>
          </div>
          <div className="dashboard-user">
            <div className="dashboard-avatar">J</div>
            <div>
              <strong>Christine</strong>
              <span>Community Member</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <p className="browse-eyebrow">YOUR COMMUNITY SPACE</p>
              <h1>Good day, Christine <span>♡</span></h1>
              <p>Here's a little overview of your sharing activity.</p>
            </div>
            <Link href="/share" className="dashboard-add-button">
              + Share an item
            </Link>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span>My listings</span>
                <span className="dashboard-stat-icon">▤</span>
              </div>
              <strong>3</strong>
              <p>Items you have shared</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span>Active requests</span>
                <span className="dashboard-stat-icon">⇄</span>
              </div>
              <strong>2</strong>
              <p>Requests in progress</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span>Completed</span>
                <span className="dashboard-stat-icon">✓</span>
              </div>
              <strong>1</strong>
              <p>Items rehomed</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span>Community impact</span>
                <span className="dashboard-stat-icon">♡</span>
              </div>
              <strong>4 <small>items</small></strong>
              <p>Shared in the community</p>
            </div>
          </div>

          <div className="dashboard-columns">
            <section className="dashboard-panel listings-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>My listings</h2>
                  <p>Manage the items you've shared.</p>
                </div>
                <Link href="/items">Browse all ↗</Link>
              </div>

              <div className="dashboard-listings">
                {myListings.map((item, index) => (
                  <div className="dashboard-listing" key={index}>
                    <div className={`dashboard-listing-image ${item.color}`}>
                      {item.emoji}
                    </div>
                    <div className="dashboard-listing-info">
                      <strong>{item.name}</strong>
                      <span>{item.category} · {item.type}</span>
                    </div>
                    <span className={`dashboard-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/share" className="dashboard-panel-footer">
                + Add another listing
              </Link>
            </section>

            <section className="dashboard-panel activity-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Recent activity</h2>
                  <p>Your latest community updates.</p>
                </div>
              </div>

              <div className="dashboard-activities">
                {activities.map((activity, index) => (
                  <div className="dashboard-activity" key={index}>
                    <div className="dashboard-activity-icon">{activity.icon}</div>
                    <div className="dashboard-activity-info">
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="dashboard-impact-banner">
            <div>
              <p className="browse-eyebrow">SMALL ACTS, BIG IMPACT</p>
              <h2>Giving things a second life<br />makes our community better.</h2>
              <p>Keep sharing. Keep making a difference.</p>
            </div>
            <span className="dashboard-impact-art">♻️</span>
          </div>
        </div>
      </section>

      <LogoutModal
        isOpen={logoutModalOpen}
        onConfirm={() => {
          logoutUser();
          window.location.href = "/login";
        }}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </main>
  );
}
