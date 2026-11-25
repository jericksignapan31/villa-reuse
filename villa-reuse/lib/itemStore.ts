// Centralized item storage for Browse Items
export type ItemStatus = "Available" | "Reserved" | "Completed";

export interface BrowseItem {
  id: number;
  name: string;
  category: string;
  condition: string;
  type: "Donation" | "Exchange";
  emoji: string;
  color: string;
  location: string;
  status: ItemStatus;
  datePosted: string;
}

// Favorites tracking
export const initialFavoriteIds: number[] = [1, 3];

// New listings storage key
export const NEW_LISTINGS_STORAGE_KEY = "userListings";

export const isItemFavorited = (itemId: number, favoriteIds: number[]) => {
  return favoriteIds.includes(itemId);
};

export const toggleFavorite = (itemId: number, favoriteIds: number[]) => {
  if (favoriteIds.includes(itemId)) {
    return favoriteIds.filter((id) => id !== itemId);
  } else {
    return [...favoriteIds, itemId];
  }
};

// Helper to add item to Browse Items
export const addToBrowseItems = (item: BrowseItem): BrowseItem[] => {
  return [...initialBrowseItems, item];
};

// Helper to get next available ID
export const getNextItemId = (): number => {
  return Math.max(...initialBrowseItems.map((item) => item.id), 0) + 1;
};

export const initialBrowseItems: BrowseItem[] = [
  {
    id: 1,
    name: "A little collection of good reads",
    category: "Books & School",
    condition: "Good condition",
    type: "Donation",
    emoji: "📚",
    color: "book",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 24, 2026",
  },
  {
    id: 2,
    name: "Wooden bedside table",
    category: "Furniture",
    condition: "Well maintained",
    type: "Exchange",
    emoji: "🪑",
    color: "furniture",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 23, 2026",
  },
  {
    id: 3,
    name: "Everyday tote bag",
    category: "Clothing",
    condition: "Like new",
    type: "Donation",
    emoji: "👜",
    color: "clothing",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 22, 2026",
  },
  {
    id: 4,
    name: "Kitchen essentials set",
    category: "Household",
    condition: "Good condition",
    type: "Exchange",
    emoji: "🍵",
    color: "household",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 21, 2026",
  },
  {
    id: 5,
    name: "Desk organizer",
    category: "Household",
    condition: "Like new",
    type: "Donation",
    emoji: "🗂️",
    color: "organizer",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 20, 2026",
  },
  {
    id: 6,
    name: "Plant pots collection",
    category: "Others",
    condition: "Good condition",
    type: "Donation",
    emoji: "🪴",
    color: "plants",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 19, 2026",
  },
  {
    id: 7,
    name: "School backpack",
    category: "Books & School",
    condition: "Well maintained",
    type: "Exchange",
    emoji: "🎒",
    color: "bag",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 18, 2026",
  },
  {
    id: 8,
    name: "Small table lamp",
    category: "Electronics",
    condition: "Good condition",
    type: "Donation",
    emoji: "💡",
    color: "lamp",
    location: "Community member",
    status: "Available",
    datePosted: "Nov 17, 2026",
  },
];
