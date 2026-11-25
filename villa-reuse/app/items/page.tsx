
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { initialBrowseItems, initialFavoriteIds, toggleFavorite, type BrowseItem, NEW_LISTINGS_STORAGE_KEY } from "@/lib/itemStore";

const categories = [
  "All categories",
  "Household",
  "Books & School",
  "Clothing",
  "Furniture",
  "Electronics",
  "Others",
];

export default function BrowseItemsPage() {
  const [items, setItems] = useState(initialBrowseItems);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [type, setType] = useState("All");
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Load favorites and user listings from localStorage on mount
  useEffect(() => {
    // Load favorites
    const saved = localStorage.getItem("favoriteIds");
    if (saved) {
      setFavoriteIds(JSON.parse(saved));
    } else {
      setFavoriteIds(initialFavoriteIds);
    }

    // Load user-created listings
    const userListings = localStorage.getItem(NEW_LISTINGS_STORAGE_KEY);
    if (userListings) {
      try {
        const parsed = JSON.parse(userListings) as BrowseItem[];
        // Merge user listings with initial items
        setItems([...initialBrowseItems, ...parsed]);
      } catch (e) {
        console.error("Failed to load user listings:", e);
        setItems(initialBrowseItems);
      }
    } else {
      setItems(initialBrowseItems);
    }

    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
    }
  }, [favoriteIds, isLoaded]);

  const handleToggleFavorite = (itemId: number) => {
    setFavoriteIds(toggleFavorite(itemId, favoriteIds));
  };
  
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All categories" || item.category === category;

      const matchesType = type === "All" || item.type === type;

      const matchesAvailability = !hideUnavailable || item.status === "Available";

      return matchesSearch && matchesCategory && matchesType && matchesAvailability;
    });

    // Sort items
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime());
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [search, category, type, hideUnavailable, sortBy, items]);

  return (
    <main className="browse-page">
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
          <Link href="/register" className="browse-join">Join our community ↗</Link>
        </div>
      </header>

      <section className="browse-content">
        <div className="browse-heading">
          <div>
            <p className="browse-eyebrow">EXPLORE THE COMMUNITY</p>
            <h1>Find something <span>useful.</span></h1>
            <p className="browse-subtitle">
              Discover items waiting for a new home.
            </p>
          </div>

          <div className="browse-count">
            <strong>{filteredItems.length}</strong>
            <span>items found</span>
          </div>
        </div>

        <div className="browse-toolbar">
          <div className="browse-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>

          <div className="browse-type-filter">
            {["All", "Donation", "Exchange"].map((option) => (
              <button
                key={option}
                className={type === option ? "selected" : ""}
                onClick={() => setType(option)}
              >
                {option === "All" ? "All items" : option}
              </button>
            ))}
          </div>

          <div className="browse-toolbar-right">
            <div className="browse-sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>

            <div className="browse-availability-filter">
              <label htmlFor="hide-unavailable">
                <input
                  id="hide-unavailable"
                  type="checkbox"
                  checked={hideUnavailable}
                  onChange={(e) => setHideUnavailable(e.target.checked)}
                />
                <span>Hide unavailable</span>
              </label>
            </div>
          </div>
        </div>

        <div className="browse-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "selected" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="browse-grid">
          {filteredItems.map((item) => (
            <article className="browse-card" key={item.id}>
              <div className={`browse-card-visual ${item.color}`}>
                <span className={`browse-badge ${item.type.toLowerCase()}`}>
                  {item.type}
                </span>
                {item.status !== "Available" && (
                  <span className={`browse-status-badge status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                )}
                <button
                  className={`browse-favorite ${favoriteIds.includes(item.id) ? "favorited" : ""}`}
                  aria-label={favoriteIds.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => handleToggleFavorite(item.id)}
                >
                  {favoriteIds.includes(item.id) ? "♥" : "♡"}
                </button>
                <span className="browse-item-emoji">{item.emoji}</span>
              </div>

              <div className="browse-card-details">
                <span className="browse-item-category">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.condition}</p>

                <div className="browse-card-bottom">
                  <span className="browse-owner">♙ {item.location}</span>
                <Link
  href={`/items/${item.id}`}
  className="browse-view-button"
>
  View item ↗
</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="browse-empty">
            <span>🔎</span>
            <h3>No items found</h3>
            <p>Try another keyword or change your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setType("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="browse-share-banner">
          <div>
            <p className="browse-eyebrow">HAVE SOMETHING TO SHARE?</p>
            <h2>Your unused things could be<br />someone else&apos;s treasure.</h2>
            <p>Post an item and give it a new home in your community.</p>
          </div>
          <Link href="/share" className="browse-share-cta">
            Share an item ↗
          </Link>
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
    </main>
  );
}
