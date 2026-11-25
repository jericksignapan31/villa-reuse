
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { initialBrowseItems, type ItemStatus as BrowseItemStatus } from "@/lib/itemStore";

type ItemStatus = "Available" | "Requested" | "Reserved" | "Completed";

type RequestStatus = "Pending" | "Accepted" | "Rejected";

type Request = {
  id: number;
  listingId: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestedDate: string;
  message: string;
  status: RequestStatus;
};

type Listing = {
  id: number;
  name: string;
  category: string;
  condition: string;
  type: "Donation" | "Exchange";
  status: ItemStatus;
  location: string;
  description: string;
};

const initialListings: Listing[] = [
  {
    id: 1,
    name: "Wooden Study Table",
    category: "Furniture",
    condition: "Good",
    type: "Donation",
    status: "Available",
    location: "Villa community",
    description: "A sturdy study table that is still in good condition.",
  },
  {
    id: 2,
    name: "Unused School Backpack",
    category: "School Supplies",
    condition: "Like New",
    type: "Donation",
    status: "Requested",
    location: "Villa community",
    description: "Extra backpack that may be useful for a student.",
  },
  {
    id: 3,
    name: "Electric Fan",
    category: "Appliances",
    condition: "Good",
    type: "Exchange",
    status: "Reserved",
    location: "Villa community",
    description: "Working electric fan. Looking for an exchange item.",
  },
  {
    id: 4,
    name: "Plastic Storage Boxes",
    category: "Home & Living",
    condition: "Good",
    type: "Donation",
    status: "Completed",
    location: "Villa community",
    description: "Storage boxes no longer needed at home.",
  },
];

const initialRequests: Request[] = [
  {
    id: 1,
    listingId: 2,
    requesterName: "Sarah Johnson",
    requesterEmail: "sarah.johnson@example.com",
    requesterPhone: "+63 917 123 4567",
    requestedDate: "Nov 23, 2026",
    message: "I really need a backpack for my school. This one looks perfect for my needs.",
    status: "Pending",
  },
];

const filters = ["All", "Available", "Requested", "Reserved", "Completed"];

export default function MyListingsPage() {
  const [listings, setListings] = useState(initialListings);
  const [browseItems, setBrowseItems] = useState(initialBrowseItems);
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilter, setActiveFilter] = useState("All");
  const [editingItem, setEditingItem] = useState<Listing | null>(null);
  const [deletingItem, setDeletingItem] = useState<Listing | null>(null);
  const [viewingRequest, setViewingRequest] = useState<Request | null>(null);
  const [completingItem, setCompletingItem] = useState<Listing | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{
    type: "accept" | "reject";
    request: Request;
  } | null>(null);

  // Load user-created listings from localStorage on mount
  useEffect(() => {
    const userListings = localStorage.getItem("userListings");
    if (userListings) {
      try {
        const parsed = JSON.parse(userListings);
        // Convert BrowseItem to Listing format
        const convertedListings: Listing[] = parsed.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          condition: item.condition,
          type: item.type,
          status: item.status as ItemStatus,
          location: item.location,
          description: "", // User listings don't have descriptions initially
        }));
        // Add user listings to the existing listings
        setListings([...initialListings, ...convertedListings]);
      } catch (e) {
        console.error("Failed to load user listings:", e);
      }
    }
  }, []);

  // Helper to sync listing status to browse items
  const updateBrowseItemStatus = (listingId: number, newStatus: BrowseItemStatus) => {
    setBrowseItems((current) =>
      current.map((item) =>
        item.id === listingId ? { ...item, status: newStatus } : item
      )
    );
  };

  const filteredListings =
    activeFilter === "All"
      ? listings
      : listings.filter((item) => item.status === activeFilter);

  // GET REQUESTS FOR A LISTING
  const getRequestsForListing = (listingId: number) => {
    return requests.filter(
      (req) => req.listingId === listingId && req.status === "Pending"
    );
  };

  // OPEN DELETE CONFIRMATION
  const handleDelete = (item: Listing) => {
    setDeletingItem(item);
  };

  // CONFIRM DELETE
  const confirmDelete = () => {
    if (!deletingItem) return;

    setListings((current) =>
      current.filter((item) => item.id !== deletingItem.id)
    );

    setDeletingItem(null);
  };

  // SAVE EDITED LISTING
  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (!editingItem.name.trim() || !editingItem.description.trim()) {
      alert("Please fill in the item name and description.");
      return;
    }

    setListings((current) =>
      current.map((item) =>
        item.id === editingItem.id ? editingItem : item
      )
    );

    setEditingItem(null);
    alert("Listing updated successfully!");
  };

  // OPEN CONFIRMATION FOR ACCEPT/REJECT
  const handleRequestAction = (request: Request, type: "accept" | "reject") => {
    setConfirmingAction({ type, request });
  };

  // CONFIRM ACCEPT REQUEST
  const confirmAcceptRequest = () => {
    if (!confirmingAction || confirmingAction.type !== "accept") return;

    const request = confirmingAction.request;

    // Check if there's already an accepted request for this item
    const hasAcceptedRequest = requests.some(
      (req) =>
        req.listingId === request.listingId &&
        req.status === "Accepted" &&
        req.id !== request.id
    );

    if (hasAcceptedRequest) {
      alert("This item already has an accepted request. You can only have one accepted request per item.");
      setConfirmingAction(null);
      return;
    }

    // Update request status to Accepted
    setRequests((current) =>
      current.map((req) =>
        req.id === request.id ? { ...req, status: "Accepted" } : req
      )
    );

    // Update listing status to Reserved
    setListings((current) =>
      current.map((item) =>
        item.id === request.listingId
          ? { ...item, status: "Reserved" as ItemStatus }
          : item
      )
    );

    // Sync to browse items
    updateBrowseItemStatus(request.listingId, "Reserved");

    setViewingRequest(null);
    setConfirmingAction(null);
  };

  // CONFIRM REJECT REQUEST
  const confirmRejectRequest = () => {
    if (!confirmingAction || confirmingAction.type !== "reject") return;

    const request = confirmingAction.request;

    // Update request status to Rejected
    setRequests((current) =>
      current.map((req) =>
        req.id === request.id ? { ...req, status: "Rejected" } : req
      )
    );

    // Check if there are other accepted requests
    const otherAcceptedRequests = requests.filter(
      (req) =>
        req.listingId === request.listingId &&
        req.status === "Accepted" &&
        req.id !== request.id
    );

    // If no other accepted requests, return item to Available
    if (otherAcceptedRequests.length === 0) {
      setListings((current) =>
        current.map((item) =>
          item.id === request.listingId
            ? { ...item, status: "Available" as ItemStatus }
            : item
        )
      );

      // Sync to browse items
      updateBrowseItemStatus(request.listingId, "Available");
    }

    setViewingRequest(null);
    setConfirmingAction(null);
  };

  // MARK ITEM AS COMPLETE
  const handleCompleteItem = (item: Listing) => {
    setCompletingItem(item);
  };

  const confirmCompleteItem = () => {
    if (!completingItem) return;

    // Update listing status to Completed
    setListings((current) =>
      current.map((item) =>
        item.id === completingItem.id
          ? { ...item, status: "Completed" as ItemStatus }
          : item
      )
    );

    // Sync to browse items
    updateBrowseItemStatus(completingItem.id, "Completed");

    setCompletingItem(null);
  };

  return (
    <main className="my-listings-page">
      <div className="my-listings-container">
        <Link href="/dashboard" className="my-listings-back">
          ← Back to Dashboard
        </Link>

        {/* PAGE HEADER */}
        <div className="my-listings-header">
          <div>
            <p className="my-listings-eyebrow">
              YOUR COMMUNITY CONTRIBUTIONS
            </p>
            <h1>My Listings</h1>
            <p className="my-listings-subtitle">
              Manage the items you have shared with your community.
            </p>
          </div>

          <Link href="/share" className="my-listings-add-button">
            + Share an Item
          </Link>
        </div>

        {/* STATS */}
        <div className="my-listings-stats">
          <div className="my-listings-stat-card">
            <span>Total Listings</span>
            <strong>{listings.length}</strong>
          </div>

          <div className="my-listings-stat-card">
            <span>Available</span>
            <strong>
              {listings.filter((item) => item.status === "Available").length}
            </strong>
          </div>

          <div className="my-listings-stat-card">
            <span>Requests</span>
            <strong>
              {listings.filter((item) => item.status === "Requested").length}
            </strong>
          </div>

          <div className="my-listings-stat-card">
            <span>Completed</span>
            <strong>
              {listings.filter((item) => item.status === "Completed").length}
            </strong>
          </div>
        </div>

        {/* FILTERS */}
        <div className="my-listings-filter-section">
          <div className="my-listings-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`my-listings-filter ${
                  activeFilter === filter ? "active" : ""
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="my-listings-count">
            Showing <strong>{filteredListings.length}</strong> listing
            {filteredListings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* EMPTY STATE */}
        {filteredListings.length === 0 ? (
          <div className="my-listings-empty">
            <div className="my-listings-empty-icon">♻</div>
            <h3>No listings found</h3>
            <p>You don't have any items in this category yet.</p>

            <Link href="/share" className="my-listings-add-button">
              Share Your First Item
            </Link>
          </div>
        ) : (
          /* LISTINGS */
          <div className="my-listings-grid">
            {filteredListings.map((item) => (
              <article className="my-listing-card" key={item.id}>
                <div className="my-listing-visual">
                  <span className="my-listing-category">{item.category}</span>

                  <div className="my-listing-placeholder-icon">♻</div>

                  <span
                    className={`my-listing-status status-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="my-listing-content">
                  <div className="my-listing-type">{item.type}</div>

                  <h3>{item.name}</h3>

                  <p className="my-listing-description">
                    {item.description}
                  </p>

                  <div className="my-listing-details">
                    <span>Condition: {item.condition}</span>
                    <span>📍 {item.location}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="my-listing-actions">
                    <button
                      type="button"
                      className="my-listing-edit"
                      onClick={() => setEditingItem({ ...item })}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="my-listing-delete"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>

                    {item.status === "Requested" && (
                      <button
                        type="button"
                        className="my-listing-view-request"
                        onClick={() => {
                          const itemRequests = getRequestsForListing(item.id);
                          if (itemRequests.length > 0) {
                            setViewingRequest(itemRequests[0]);
                          }
                        }}
                      >
                        View Request
                      </button>
                    )}

                    {item.status === "Reserved" && (
                      <button
                        type="button"
                        className="my-listing-complete"
                        onClick={() => handleCompleteItem(item)}
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
      </div>

      {/* EDIT LISTING MODAL */}
      {editingItem && (
        <div className="edit-listing-overlay">
          <div className="edit-listing-modal">
            <div className="edit-listing-modal-header">
              <div>
                <p className="my-listings-eyebrow">UPDATE YOUR ITEM</p>
                <h2>Edit Listing</h2>
              </div>

              <button
                type="button"
                className="edit-listing-close"
                onClick={() => setEditingItem(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="edit-listing-form">
              <label>
                Item Name
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Category
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value,
                    })
                  }
                >
                  <option>Furniture</option>
                  <option>Clothing</option>
                  <option>Books & School</option>
                  <option>School Supplies</option>
                  <option>Appliances</option>
                  <option>Home & Living</option>
                  <option>Electronics</option>
                  <option>Toys & Games</option>
                  <option>Others</option>
                </select>
              </label>

              <label>
                Condition
                <select
                  value={editingItem.condition}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      condition: e.target.value,
                    })
                  }
                >
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Needs Repair</option>
                </select>
              </label>

              <label>
                Listing Type
                <select
                  value={editingItem.type}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      type: e.target.value as "Donation" | "Exchange",
                    })
                  }
                >
                  <option value="Donation">Donation</option>
                  <option value="Exchange">Exchange</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  rows={4}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </label>

              <div className="edit-listing-modal-actions">
                <button
                  type="button"
                  className="edit-listing-cancel"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="edit-listing-save"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="edit-listing-overlay">
          <div className="delete-listing-modal">
            <div className="delete-listing-icon">🗑️</div>

            <h2>Delete Listing?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deletingItem.name}</strong>? This action cannot be undone.
            </p>

            <div className="delete-listing-actions">
              <button
                type="button"
                className="delete-listing-cancel"
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-listing-confirm"
                onClick={confirmDelete}
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REQUEST MODAL */}
      {viewingRequest && (
        <div className="edit-listing-overlay">
          <div className="view-request-modal">
            <div className="view-request-modal-header">
              <div>
                <p className="my-listings-eyebrow">NEW REQUEST</p>
                <h2>Review Request</h2>
              </div>

              <button
                type="button"
                className="edit-listing-close"
                onClick={() => setViewingRequest(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="view-request-content">
              <div className="request-requester-info">
                <div className="request-avatar">
                  {viewingRequest.requesterName.charAt(0)}
                </div>

                <div className="request-requester-details">
                  <strong>{viewingRequest.requesterName}</strong>
                  <span>{viewingRequest.requesterEmail}</span>
                  <span>{viewingRequest.requesterPhone}</span>
                </div>
              </div>

              <div className="request-divider"></div>

              <div className="request-item-info">
                <label>Requesting for:</label>
                <strong>
                  {listings.find((l) => l.id === viewingRequest.listingId)
                    ?.name || "Item"}
                </strong>
              </div>

              <div className="request-date-info">
                <label>Request Date:</label>
                <span>{viewingRequest.requestedDate}</span>
              </div>

              <div className="request-message">
                <label>Message:</label>
                <p>{viewingRequest.message}</p>
              </div>

              <div className="view-request-actions">
                <button
                  type="button"
                  className="view-request-reject"
                  onClick={() => handleRequestAction(viewingRequest, "reject")}
                >
                  Reject Request
                </button>

                <button
                  type="button"
                  className="view-request-accept"
                  onClick={() => handleRequestAction(viewingRequest, "accept")}
                >
                  Accept Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST ACTION CONFIRMATION MODAL */}
      {confirmingAction && (
        <div className="edit-listing-overlay">
          <div
            className={`confirm-request-modal confirm-request-${confirmingAction.type}`}
          >
            <div className="confirm-request-icon">
              {confirmingAction.type === "accept" ? "✓" : "✕"}
            </div>

            <h2>
              {confirmingAction.type === "accept"
                ? "Accept Request?"
                : "Reject Request?"}
            </h2>

            <p>
              {confirmingAction.type === "accept"
                ? `Are you sure you want to accept the request from ${confirmingAction.request.requesterName}? The item will be marked as Reserved.`
                : `Are you sure you want to reject the request from ${confirmingAction.request.requesterName}?`}
            </p>

            <div className="confirm-request-actions">
              <button
                type="button"
                className="confirm-request-cancel"
                onClick={() => setConfirmingAction(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmingAction.type === "accept"
                    ? "confirm-request-accept"
                    : "confirm-request-reject"
                }
                onClick={
                  confirmingAction.type === "accept"
                    ? confirmAcceptRequest
                    : confirmRejectRequest
                }
              >
                {confirmingAction.type === "accept"
                  ? "Accept Request"
                  : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK COMPLETE CONFIRMATION MODAL */}
      {completingItem && (
        <div className="edit-listing-overlay">
          <div className="complete-listing-modal">
            <div className="complete-listing-icon">✓</div>

            <h2>Mark as Complete?</h2>

            <p>
              Are you sure you want to mark <strong>{completingItem.name}</strong> as
              completed? This means the transaction has been successfully
              completed with the requester.
            </p>

            <div className="complete-listing-actions">
              <button
                type="button"
                className="complete-listing-keep"
                onClick={() => setCompletingItem(null)}
              >
                Not Yet
              </button>

              <button
                type="button"
                className="complete-listing-confirm"
                onClick={confirmCompleteItem}
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
