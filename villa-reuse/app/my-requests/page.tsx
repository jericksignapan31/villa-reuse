
"use client";

import { useState } from "react";
import Link from "next/link";

type RequestStatus = "Pending" | "Approved" | "Rejected" | "Completed";

type MyRequest = {
  id: number;
  itemName: string;
  category: string;
  owner: string;
  date: string;
  type: "Donation" | "Exchange";
  status: RequestStatus;
  emoji: string;
  description: string;
};

const initialRequests: MyRequest[] = [
  {
    id: 1,
    itemName: "Study Desk Lamp",
    category: "Home & Living",
    owner: "Maria Santos",
    date: "Nov 22, 2026",
    type: "Donation",
    status: "Pending",
    emoji: "💡",
    description: "A desk lamp for my study area.",
  },
  {
    id: 2,
    itemName: "Basic School Backpack",
    category: "School Supplies",
    owner: "John Reyes",
    date: "Nov 20, 2026",
    type: "Donation",
    status: "Approved",
    emoji: "🎒",
    description: "Backpack for everyday school use.",
  },
  {
    id: 3,
    itemName: "Small Bookshelf",
    category: "Furniture",
    owner: "Ana Cruz",
    date: "Nov 18, 2026",
    type: "Exchange",
    status: "Completed",
    emoji: "📚",
    description: "A small bookshelf for books and school materials.",
  },
  {
    id: 4,
    itemName: "Reusable Water Bottle",
    category: "Others",
    owner: "Carlo Lim",
    date: "Nov 17, 2026",
    type: "Donation",
    status: "Rejected",
    emoji: "🧴",
    description: "Reusable bottle for daily use.",
  },
];

const filters = ["All", "Pending", "Approved", "Rejected", "Completed"];

export default function MyRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelingRequest, setCancelingRequest] = useState<MyRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MyRequest | null>(null);
  const [completingRequest, setCompletingRequest] = useState<MyRequest | null>(null);

  const filteredRequests =
    activeFilter === "All"
      ? requests
      : requests.filter((request) => request.status === activeFilter);

  const handleCancelRequest = (request: MyRequest) => {
    setCancelingRequest(request);
  };

  const confirmCancelRequest = () => {
    if (!cancelingRequest) return;

    setRequests((current) =>
      current.filter((request) => request.id !== cancelingRequest.id)
    );

    setCancelingRequest(null);
  };

  const handleMarkComplete = (request: MyRequest) => {
    setCompletingRequest(request);
  };

  const confirmMarkComplete = () => {
    if (!completingRequest) return;

    setRequests((current) =>
      current.map((request) =>
        request.id === completingRequest.id
          ? { ...request, status: "Completed" as const }
          : request
      )
    );

    setCompletingRequest(null);
    setViewingRequest(null);
  };

  const countStatus = (status: RequestStatus) =>
    requests.filter((request) => request.status === status).length;

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return "pending";
      case "Approved":
        return "approved";
      case "Rejected":
        return "rejected";
      case "Completed":
        return "completed";
    }
  };

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return "⏳ Pending";
      case "Approved":
        return "✓ Approved";
      case "Rejected":
        return "✕ Rejected";
      case "Completed":
        return "✓ Completed";
    }
  };

  return (
    <main className="my-requests-page">
      <div className="my-requests-container">
        <Link href="/dashboard" className="my-requests-back">
          ← Back to Dashboard
        </Link>

        <header className="my-requests-header">
          <div>
            <p className="my-requests-eyebrow">YOUR COMMUNITY ACTIVITY</p>
            <h1>My Requests</h1>
            <p className="my-requests-subtitle">
              Track the items you requested from your community.
            </p>
          </div>

          <Link href="/items" className="my-requests-browse-button">
            Browse Items
          </Link>
        </header>

        <section className="my-requests-stats">
          <div className="my-requests-stat-card">
            <span>Total Requests</span>
            <strong>{requests.length}</strong>
          </div>

          <div className="my-requests-stat-card">
            <span>Pending</span>
            <strong>{countStatus("Pending")}</strong>
          </div>

          <div className="my-requests-stat-card">
            <span>Approved</span>
            <strong>{countStatus("Approved")}</strong>
          </div>

          <div className="my-requests-stat-card">
            <span>Completed</span>
            <strong>{countStatus("Completed")}</strong>
          </div>
        </section>

        <section className="my-requests-list-section">
          <div className="my-requests-filter-header">
            <div className="my-requests-filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`my-requests-filter ${
                    activeFilter === filter ? "active" : ""
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <p className="my-requests-count">
              Showing <strong>{filteredRequests.length}</strong> request
              {filteredRequests.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="my-requests-empty">
              <div className="my-requests-empty-icon">♡</div>
              <h3>No requests found</h3>
              <p>You don't have any requests in this category.</p>
              <Link href="/items" className="my-requests-browse-button">
                Explore Community Items
              </Link>
            </div>
          ) : (
            <div className="my-requests-grid">
              {filteredRequests.map((request) => (
                <article className="my-request-card" key={request.id}>
                  <div className="my-request-visual">
                    <span className="my-request-category">
                      {request.category}
                    </span>
                    <span className="my-request-emoji">{request.emoji}</span>
                    <span
                      className={`my-request-status status-${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="my-request-content">
                    <span className="my-request-type">{request.type}</span>
                    <h3>{request.itemName}</h3>
                    <p className="my-request-description">
                      {request.description}
                    </p>

                    <div className="my-request-owner">
                      <div className="my-request-avatar">
                        {request.owner.charAt(0)}
                      </div>
                      <div>
                        <span>Item owner</span>
                        <strong>{request.owner}</strong>
                      </div>
                    </div>

                    <div className="my-request-date">
                      Requested on {request.date}
                    </div>

                    <div className="my-request-actions">
                      <button
                        className="my-request-view-button"
                        onClick={() => setViewingRequest(request)}
                      >
                        View Details
                      </button>

                      {request.status === "Pending" && (
                        <button
                          className="my-request-cancel-button"
                          onClick={() => handleCancelRequest(request)}
                        >
                          Cancel Request
                        </button>
                      )}

                      {request.status === "Approved" && (
                        <button
                          className="my-request-complete-button"
                          onClick={() => handleMarkComplete(request)}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CANCEL REQUEST CONFIRMATION MODAL */}
        {cancelingRequest && (
          <div className="edit-listing-overlay">
            <div className="cancel-request-modal">
              <div className="cancel-request-icon">⚠️</div>

              <h2>Cancel Request?</h2>

              <p>
                Are you sure you want to cancel your request for{" "}
                <strong>{cancelingRequest.itemName}</strong> from{" "}
                <strong>{cancelingRequest.owner}</strong>? This action cannot be
                undone.
              </p>

              <div className="cancel-request-actions">
                <button
                  type="button"
                  className="cancel-request-keep"
                  onClick={() => setCancelingRequest(null)}
                >
                  Keep Request
                </button>

                <button
                  type="button"
                  className="cancel-request-confirm"
                  onClick={confirmCancelRequest}
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW REQUEST DETAILS MODAL */}
        {viewingRequest && (
          <div className="edit-listing-overlay" onClick={() => setViewingRequest(null)}>
            <div
              className="view-request-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-modal-btn"
                onClick={() => setViewingRequest(null)}
              >
                ✕
              </button>

              <div className="request-details-header">
                <div className={`request-details-emoji ${viewingRequest.type.toLowerCase()}`}>
                  {viewingRequest.emoji}
                </div>
                <div className="request-details-title">
                  <h2>{viewingRequest.itemName}</h2>
                  <p>{viewingRequest.category}</p>
                </div>
              </div>

              <div className="request-details-divider" />

              <div className="request-details-content">
                <div className="detail-row">
                  <label>Request Status</label>
                  <span className={`status-badge ${getStatusColor(viewingRequest.status)}`}>
                    {getStatusLabel(viewingRequest.status)}
                  </span>
                </div>

                <div className="detail-row">
                  <label>Item Type</label>
                  <span>{viewingRequest.type}</span>
                </div>

                <div className="detail-row">
                  <label>Item Owner</label>
                  <div className="detail-owner">
                    <div className="detail-owner-avatar">
                      {viewingRequest.owner.charAt(0)}
                    </div>
                    <strong>{viewingRequest.owner}</strong>
                  </div>
                </div>

                <div className="detail-row">
                  <label>Requested On</label>
                  <span>{viewingRequest.date}</span>
                </div>

                <div className="request-details-divider" />

                <div className="detail-description">
                  <label>About This Item</label>
                  <p>{viewingRequest.description}</p>
                </div>
              </div>

              <div className="request-details-actions">
                {viewingRequest.status === "Pending" && (
                  <button
                    className="action-cancel"
                    onClick={() => {
                      setViewingRequest(null);
                      handleCancelRequest(viewingRequest);
                    }}
                  >
                    Cancel Request
                  </button>
                )}

                {viewingRequest.status === "Approved" && (
                  <button
                    className="action-complete"
                    onClick={() => {
                      handleMarkComplete(viewingRequest);
                    }}
                  >
                    Mark as Complete
                  </button>
                )}

                <button
                  className="action-close"
                  onClick={() => setViewingRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MARK COMPLETE CONFIRMATION MODAL */}
        {completingRequest && (
          <div className="edit-listing-overlay">
            <div className="complete-request-modal">
              <div className="complete-request-icon">✓</div>

              <h2>Mark as Complete?</h2>

              <p>
                Are you sure you want to mark your request for{" "}
                <strong>{completingRequest.itemName}</strong> as complete? This
                means you have successfully received or exchanged the item with{" "}
                <strong>{completingRequest.owner}</strong>.
              </p>

              <div className="complete-request-actions">
                <button
                  type="button"
                  className="complete-request-keep"
                  onClick={() => setCompletingRequest(null)}
                >
                  Not Yet
                </button>

                <button
                  type="button"
                  className="complete-request-confirm"
                  onClick={confirmMarkComplete}
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
