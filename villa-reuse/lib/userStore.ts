// User account and settings data management

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePicture?: string; // Data URL or file path
  joinedDate: string;
}

export interface UserSettings {
  requestNotifications: boolean;
  messageNotifications: boolean;
  communityUpdates: boolean;
}

export interface UserAccount {
  profile: UserProfile;
  settings: UserSettings;
  password?: string; // Should never be stored in real app - for demo only
}

// Storage keys
export const USER_PROFILE_STORAGE_KEY = "userProfile";
export const USER_SETTINGS_STORAGE_KEY = "userSettings";
export const USER_PASSWORD_STORAGE_KEY = "userPassword"; // Demo only - never do this in production!

// Default profile
export const defaultUserProfile: UserProfile = {
  id: "user-001",
  name: "Christine Metillo",
  email: "ChristineMetillo@example.com",
  phone: "+63 912 345 6789",
  address: "Villa Community",
  joinedDate: "Nov 1, 2024",
};

// Default settings
export const defaultUserSettings: UserSettings = {
  requestNotifications: true,
  messageNotifications: true,
  communityUpdates: false,
};

// Load user profile from localStorage or return default
export const loadUserProfile = (): UserProfile => {
  if (typeof window === "undefined") return defaultUserProfile;

  const stored = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user profile:", e);
      return defaultUserProfile;
    }
  }
  return defaultUserProfile;
};

// Save user profile to localStorage
export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

// Load user settings from localStorage or return default
export const loadUserSettings = (): UserSettings => {
  if (typeof window === "undefined") return defaultUserSettings;

  const stored = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user settings:", e);
      return defaultUserSettings;
    }
  }
  return defaultUserSettings;
};

// Save user settings to localStorage
export const saveUserSettings = (settings: UserSettings): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

// Demo password validation - DO NOT USE IN PRODUCTION
export const setUserPassword = (password: string): void => {
  if (typeof window === "undefined") return;
  // In production: hash the password and send to backend
  localStorage.setItem(USER_PASSWORD_STORAGE_KEY, password);
};

export const verifyUserPassword = (password: string): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(USER_PASSWORD_STORAGE_KEY);
  return stored === password;
};

// Get stored password (demo only - would not exist in real app)
export const getStoredPassword = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_PASSWORD_STORAGE_KEY) || "";
};

// Profile validation
export interface ProfileValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const validateProfile = (
  profile: Partial<UserProfile>
): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {};

  if (!profile.name || profile.name.trim().length === 0) {
    errors.name = "Full name is required";
  } else if (profile.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!profile.email || profile.email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!isValidEmail(profile.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (profile.phone && profile.phone.trim().length > 0) {
    if (!isValidPhone(profile.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  if (!profile.address || profile.address.trim().length === 0) {
    errors.address = "Community or address is required";
  } else if (profile.address.trim().length < 2) {
    errors.address = "Address must be at least 2 characters";
  }

  return errors;
};

// Password validation
export interface PasswordValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationErrors => {
  const errors: PasswordValidationErrors = {};

  if (!currentPassword) {
    errors.currentPassword = "Current password is required";
  } else if (!verifyUserPassword(currentPassword)) {
    errors.general = "Current password is incorrect";
  }

  if (!newPassword) {
    errors.newPassword = "New password is required";
  } else if (newPassword.length < 6) {
    errors.newPassword = "Password must be at least 6 characters";
  } else if (newPassword === currentPassword) {
    errors.newPassword = "New password must be different from current password";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

// Helper functions for validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Basic validation - accepts common phone formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 7;
};
