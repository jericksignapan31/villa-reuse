
"use client";

import { useState } from "react";
import Link from "next/link";
import { initialBrowseItems, type BrowseItem } from "@/lib/itemStore";

type FormErrors = {
  itemName?: string;
  description?: string;
  category?: string;
  condition?: string;
  location?: string;
  photo?: string;
};

export default function ShareItemPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<BrowseItem | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    setErrors((prev) => ({ ...prev, photo: undefined }));

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const validateForm = (formData: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    const itemName = formData.get("itemName") as string;
    if (!itemName?.trim()) {
      newErrors.itemName = "Item name is required";
    }

    const description = formData.get("description") as string;
    if (!description?.trim()) {
      newErrors.description = "Description is required";
    }

    const category = formData.get("category") as string;
    if (!category) {
      newErrors.category = "Please select a category";
    }

    const condition = formData.get("condition") as string;
    if (!condition) {
      newErrors.condition = "Please select condition";
    }

    const location = formData.get("location") as string;
    if (!location?.trim()) {
      newErrors.location = "Pickup location is required";
    }

    if (!photo) {
      newErrors.photo = "Please upload a photo";
    }

    return newErrors;
  };

  const getEmojiForCategory = (category: string): string => {
    const emojiMap: Record<string, string> = {
      "Household": "🍵",
      "Books & School": "📚",
      "Clothing": "👜",
      "Furniture": "🪑",
      "Electronics": "💡",
      "Others": "🎁",
    };
    return emojiMap[category] || "📦";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newErrors = validateForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create new listing
    const itemName = formData.get("itemName") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const condition = formData.get("condition") as string;
    const sharingType = formData.get("sharingType") as "Donation" | "Exchange";
    const location = formData.get("location") as string;

    // Load existing user listings
    const existingListings = localStorage.getItem("userListings");
    let userListings: BrowseItem[] = [];
    if (existingListings) {
      try {
        userListings = JSON.parse(existingListings);
      } catch (e) {
        console.error("Failed to load existing listings:", e);
      }
    }

    // Generate new ID (next available)
    const allListingIds = [
      ...initialBrowseItems.map((item) => item.id),
      ...userListings.map((item) => item.id),
    ];
    const nextId = Math.max(...allListingIds, 0) + 1;

    const newItem: BrowseItem = {
      id: nextId,
      name: itemName,
      category: category as any,
      condition,
      type: sharingType,
      emoji: getEmojiForCategory(category),
      color: category.toLowerCase().replace(/\s+/g, "-"),
      location: "Villa community",
      status: "Available",
      datePosted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    // Save to localStorage
    userListings.push(newItem);
    localStorage.setItem("userListings", JSON.stringify(userListings));

    setSubmittedItem(newItem);
    setSubmitted(true);
    setIsLoading(false);
  };

  if (submitted && submittedItem) {
    return (
      <main className="share-page">
        <div className="share-success">
          <div className="share-success-icon">✓</div>
          <h1>Your item is ready to share!</h1>
          <p>
            Thank you for giving an item a second life. Your listing has been
            submitted successfully.
          </p>

          <div className="share-success-preview">
            <div className="share-success-emoji">{submittedItem.emoji}</div>
            <div>
              <strong>{submittedItem.name}</strong>
              <span>{submittedItem.category}</span>
              <span>{submittedItem.type}</span>
            </div>
          </div>

          <Link href="/items" className="share-primary-btn">
            Browse Items
          </Link>
          <button
            className="share-secondary-btn"
            onClick={() => setSubmitted(false)}
          >
            Share another item
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="share-page">
      <div className="share-container">
        <Link href="/dashboard" className="share-back-link">
          ← Back to Dashboard
        </Link>

        <div className="share-heading">
          <span className="share-eyebrow">GIVE ITEMS A SECOND LIFE</span>
          <h1>Share something<br />you no longer need.</h1>
          <p>
            Someone in your community might find it useful. Post an item for
            donation or exchange and make sharing easier.
          </p>
        </div>

        <form className="share-form" onSubmit={handleSubmit}>
          <section className="share-form-section">
            <div className="share-section-title">
              <span className="share-step">01</span>
              <div>
                <h2>Item information</h2>
                <p>Tell the community about your item.</p>
              </div>
            </div>

            <div className="share-field">
              <label htmlFor="itemName">Item name *</label>
              <input
                id="itemName"
                name="itemName"
                placeholder="e.g. Wooden study table"
                required
                className={errors.itemName ? "error" : ""}
              />
              {errors.itemName && (
                <span className="share-field-error">{errors.itemName}</span>
              )}
            </div>

            <div className="share-field">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your item, its features, and any details others should know..."
                required
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="share-field-error">{errors.description}</span>
              )}
            </div>

            <div className="share-form-row">
              <div className="share-field">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className={errors.category ? "error" : ""}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  <option>Household</option>
                  <option>Books & School</option>
                  <option>Clothing</option>
                  <option>Furniture</option>
                  <option>Electronics</option>
                  <option>Others</option>
                </select>
                {errors.category && (
                  <span className="share-field-error">{errors.category}</span>
                )}
              </div>

              <div className="share-field">
                <label htmlFor="condition">Item condition *</label>
                <select
                  id="condition"
                  name="condition"
                  required
                  defaultValue=""
                  className={errors.condition ? "error" : ""}
                >
                  <option value="" disabled>
                    Select condition
                  </option>
                  <option>Brand New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
                {errors.condition && (
                  <span className="share-field-error">{errors.condition}</span>
                )}
              </div>
            </div>
          </section>

          <section className="share-form-section">
            <div className="share-section-title">
              <span className="share-step">02</span>
              <div>
                <h2>Sharing option</h2>
                <p>Choose how you want to share your item.</p>
              </div>
            </div>

            <div className="share-type-options">
              <label className="share-type-card">
                <input
                  type="radio"
                  name="sharingType"
                  value="Donation"
                  defaultChecked
                />
                <span className="share-type-icon">♡</span>
                <span className="share-type-name">Donation</span>
                <span className="share-type-description">
                  Give it away for free to someone who needs it.
                </span>
              </label>

              <label className="share-type-card">
                <input type="radio" name="sharingType" value="Exchange" />
                <span className="share-type-icon">↔</span>
                <span className="share-type-name">Exchange</span>
                <span className="share-type-description">
                  Exchange your item for something useful.
                </span>
              </label>
            </div>
          </section>

          <section className="share-form-section">
            <div className="share-section-title">
              <span className="share-step">03</span>
              <div>
                <h2>Item photo</h2>
                <p>Add a photo so others can see what you are sharing.</p>
              </div>
            </div>

            <label
              className={`share-upload-area ${errors.photo ? "error" : ""}`}
              htmlFor="itemPhoto"
            >
              {preview ? (
                <div className="share-photo-preview">
                  <img src={preview} alt="Item preview" />
                  <span>Click to change photo</span>
                </div>
              ) : (
                <>
                  <span className="share-upload-icon">↑</span>
                  <strong>Click to upload a photo</strong>
                  <span>PNG, JPG or WEBP</span>
                </>
              )}
            </label>

            <input
              id="itemPhoto"
              className="share-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            />

            {errors.photo && (
              <span className="share-field-error">{errors.photo}</span>
            )}

            {photo && (
              <button
                type="button"
                className="share-remove-photo"
                onClick={() => handlePhotoChange(null)}
              >
                Remove photo
              </button>
            )}
          </section>

          <section className="share-form-section">
            <div className="share-section-title">
              <span className="share-step">04</span>
              <div>
                <h2>Pickup information</h2>
                <p>Help interested members know where the item is available.</p>
              </div>
            </div>

            <div className="share-field">
              <label htmlFor="location">Community area / pickup location *</label>
              <input
                id="location"
                name="location"
                className={errors.location ? "error" : ""}
                placeholder="e.g. Villa community, Block 3"
                required
              />
              {errors.location && (
                <span className="share-field-error">{errors.location}</span>
              )}
            </div>
          </section>

          <div className="share-form-footer">
            <p>
              By publishing, you agree to share this item responsibly with the
              community.
            </p>
            <button
              type="submit"
              className="share-primary-btn"
              disabled={isLoading}
            >
              {isLoading ? "Publishing..." : "Publish Listing →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
