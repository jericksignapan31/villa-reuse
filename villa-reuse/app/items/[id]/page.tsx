
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { initialFavoriteIds, toggleFavorite } from "@/lib/itemStore";

const itemData = [
  {
    id: 1,
    name: "A little collection of good reads",
    category: "Books & School",
    condition: "Good condition",
    type: "Donation",
    emoji: "📚",
    color: "book",
    description:
      "A collection of books looking for a new owner. Perfect for someone who enjoys reading or wants to add more books to their collection.",
  },
  {
    id: 2,
    name: "Wooden bedside table",
    category: "Furniture",
    condition: "Well maintained",
    type: "Exchange",
    emoji: "🪑",
    color: "furniture",
    description:
      "A wooden bedside table that is still in good shape. Looking to exchange it for another useful household item.",
  },
  {
    id: 3,
    name: "Everyday tote bag",
    category: "Clothing",
    condition: "Like new",
    type: "Donation",
    emoji: "👜",
    color: "clothing",
    description:
      "A reusable everyday tote bag. Clean, well-kept, and ready for someone who can use it.",
  },
  {
    id: 4,
    name: "Kitchen essentials set",
    category: "Household",
    condition: "Good condition",
    type: "Exchange",
    emoji: "🍵",
    color: "household",
    description:
      "A set of useful kitchen essentials. Available for exchange with another practical item.",
  },
  {
    id: 5,
    name: "Desk organizer",
    category: "Household",
    condition: "Like new",
    type: "Donation",
    emoji: "🗂️",
    color: "organizer",
    description:
      "Keep your workspace tidy with this desk organizer. Giving it away to someone who needs it.",
  },
  {
    id: 6,
    name: "Plant pots collection",
    category: "Others",
    condition: "Good condition",
    type: "Donation",
    emoji: "🪴",
    color: "plants",
    description:
      "A collection of plant pots ready for a new home. Great for anyone who loves growing plants.",
  },
  {
    id: 7,
    name: "School backpack",
    category: "Books & School",
    condition: "Well maintained",
    type: "Exchange",
    emoji: "🎒",
    color: "bag",
    description:
      "A school backpack that is still usable and well maintained. Available for exchange.",
  },
  {
    id: 8,
    name: "Small table lamp",
    category: "Electronics",
    condition: "Good condition",
    type: "Donation",
    emoji: "💡",
    color: "lamp",
    description:
      "A small table lamp that can brighten up your study area or bedroom.",
  },
];

function ItemDetailsContent() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const params = useParams();
  const id = Number(params.id);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favoriteIds");
    if (saved) {
      setFavoriteIds(JSON.parse(saved));
    } else {
      setFavoriteIds(initialFavoriteIds);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
    }
  }, [favoriteIds, isLoaded]);

  const item = itemData.find((item) => item.id === id);
  const isFavorited = favoriteIds.includes(id);

  const handleToggleFavorite = () => {
    setFavoriteIds(toggleFavorite(id, favoriteIds));
  };

  const handleSubmitRequest = () => {
    if (!requesterName || !requesterEmail || !requesterPhone || !requestMessage) {
      alert("Please fill in all fields");
      return;
    }

    // Show success message
    setSubmitSuccess(true);

    // Reset form
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestMessage("");
      setRequesterName("");
      setRequesterEmail("");
      setRequesterPhone("");
      setSubmitSuccess(false);
    }, 2000);
  };

  if (!item) {
    return (
      <main className="item-detail-page">
        <div className="item-not-found">
          <h1>Item not found</h1>
          <Link href="/items">← Back to Browse Items</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="item-detail-page">
      <header className="browse-nav">
        <Link href="/" className="browse-logo">
          <span className="browse-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>

        <nav className="browse-nav-links">
          <Link href="/items" className="active">Discover</Link>
          <Link href="/#how-it-works">How it works</Link>
        </nav>

        <div className="browse-nav-actions">
          <Link href="/login" className="browse-login">Log in</Link>
          <Link href="/register" className="browse-join">
            Join our community ↗
          </Link>
        </div>
      </header>

      <section className="item-detail-container">
        <Link href="/items" className="item-back-link">
          ← Back to Browse Items
        </Link>

        <div className="item-detail-layout">
          <div className={`item-detail-image ${item.color}`}>
            <span className={`browse-badge ${item.type.toLowerCase()}`}>
              {item.type}
            </span>
            <span className="item-detail-emoji">{item.emoji}</span>
          </div>

          <div className="item-detail-info">
            <p className="browse-eyebrow">{item.category}</p>
            <h1>{item.name}</h1>

            <span className={`item-detail-status ${item.type.toLowerCase()}`}>
              {item.type === "Donation"
                ? "♡ Available for donation"
                : "⇄ Available for exchange"}
            </span>

            <div className="item-detail-condition">
              <span>Item condition</span>
              <strong>{item.condition}</strong>
            </div>

            <div className="item-detail-divider" />

            <h3>About this item</h3>
            <p className="item-detail-description">{item.description}</p>

            <div className="item-owner-box">
              <div className="item-owner-avatar">♙</div>
              <div>
                <span>Posted by</span>
                <strong>Community Member</strong>
              </div>
            </div>

            <button
              className="item-request-button"
              onClick={() => setShowRequestModal(true)}
            >
              {item.type === "Donation"
                ? "Request this item"
                : "Request an exchange"}
              <span>↗</span>
            </button>

            <button
              className={`item-favorite-button ${isFavorited ? "favorited" : ""}`}
              onClick={handleToggleFavorite}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorited ? "♥ Saved" : "♡ Save for later"}
            </button>

            <p className="item-detail-note">
              Be respectful and coordinate responsibly with the item owner.
            </p>
          </div>
        </div>
      </section>

      <footer className="browse-footer">
        <Link href="/" className="browse-logo">
          <span className="browse-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>
        <p>Reuse more. Waste less. Share better.</p>
        <span>© 2026 VILLA-REUSE</span>
      </footer>

      {/* REQUEST ITEM MODAL */}
      {showRequestModal && (
        <div className="edit-listing-overlay" onClick={() => !submitSuccess && setShowRequestModal(false)}>
          <div
            className="request-item-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => !submitSuccess && setShowRequestModal(false)}
              disabled={submitSuccess}
            >
              ✕
            </button>

            {submitSuccess ? (
              <div className="request-success">
                <div className="success-icon">✓</div>
                <h2>Request Sent!</h2>
                <p>Your request for <strong>{item.name}</strong> has been sent to the item owner.</p>
                <p className="success-note">You can track this request in your <strong>My Requests</strong> page.</p>
              </div>
            ) : (
              <>
                <div className="request-modal-header">
                  <div className="request-modal-emoji">{item.emoji}</div>
                  <div>
                    <p className="request-modal-label">Requesting</p>
                    <h2>{item.name}</h2>
                  </div>
                </div>

                <div className="request-modal-divider" />

                <div className="request-modal-form">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Maria Santos"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="maria@example.com"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+63 912 345 6789"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Message to Owner</label>
                    <textarea
                      placeholder="Tell the owner why you need this item..."
                      rows={4}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                    />
                  </div>

                  <div className="request-modal-actions">
                    <button
                      type="button"
                      className="request-modal-cancel"
                      onClick={() => setShowRequestModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="request-modal-submit"
                      onClick={handleSubmitRequest}
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingItemDetails() {
  return (
    <main className="item-detail-page">
      <div className="item-not-found">
        <h1>Loading...</h1>
      </div>
    </main>
  );
}

export default function ItemDetailsPage() {
  return (
    <Suspense fallback={<LoadingItemDetails />}>
      <ItemDetailsContent />
    </Suspense>
  );
}
