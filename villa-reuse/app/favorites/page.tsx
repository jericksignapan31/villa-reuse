
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { initialBrowseItems, initialFavoriteIds, toggleFavorite } from "@/lib/itemStore";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Get favorite items from Browse Items
  const favorites = initialBrowseItems.filter((item) =>
    favoriteIds.includes(item.id)
  );

  const removeFavorite = (id: number) => {
    setFavoriteIds(toggleFavorite(id, favoriteIds));
  };

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        <Link href="/dashboard" className="favorites-back">
          ← Back to Dashboard
        </Link>

        <header className="favorites-header">
          <div>
            <p className="favorites-eyebrow">YOUR SAVED FINDS</p>
            <h1>My Favorites <span>♡</span></h1>
            <p className="favorites-subtitle">
              Keep the items you love close and revisit them anytime.
            </p>
          </div>

          <Link href="/items" className="favorites-browse-button">
            Browse Items
          </Link>
        </header>

        <div className="favorites-summary">
          <div className="favorites-summary-icon">♡</div>
          <div>
            <strong>{favorites.length} saved items</strong>
            <p>Your favorite community finds in one place.</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">♡</div>
            <h2>Your favorites list is empty</h2>
            <p>
              Explore community items and save the ones you are interested in.
            </p>
            <Link href="/items" className="favorites-browse-button">
              Explore Items
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((item) => (
              <article className="favorite-card" key={item.id}>
                <div className={`favorite-visual ${item.color}`}>
                  <span className="favorite-category">{item.category}</span>
                  <span className="favorite-emoji">{item.emoji}</span>

                  <button
                    className="favorite-heart"
                    title="Remove from favorites"
                    aria-label={`Remove ${item.name} from favorites`}
                    onClick={() => removeFavorite(item.id)}
                  >
                    ♥
                  </button>
                </div>

                <div className="favorite-content">
                  <span className="favorite-type">{item.type}</span>
                  <h3>{item.name}</h3>

                  <div className="favorite-details">
                    <span>Condition: {item.condition}</span>
                    <span>Category: {item.category}</span>
                  </div>

                  <div className="favorite-actions">
                    <Link href={`/items/${item.id}`} className="favorite-view-button">
                      View Item
                    </Link>

                    <button
                      className="favorite-remove-button"
                      onClick={() => removeFavorite(item.id)}
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
