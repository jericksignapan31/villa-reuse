// Authentication and session management system

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePicture?: string;
  joinedDate: string;
  emailVerified: boolean;
  status: 'active' | 'suspended' | 'restricted';
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
  expiresAt: number | null;
  rememberMe: boolean;
}

// Storage keys
export const AUTH_SESSION_STORAGE_KEY = "authSession";
export const AUTH_TOKEN_STORAGE_KEY = "authToken";
export const AUTH_REMEMBER_KEY = "authRemember";
export const RESET_TOKEN_STORAGE_KEY = "passwordResetToken";
export const REGISTERED_USERS_KEY = "registeredUsers";

// Demo users database (simulated backend)
export const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  "christine@example.com": {
    password: "password123", // Demo only - never store passwords like this!
    user: {
      id: "user-001",
      name: "Christine Metillo",
      email: "christine@example.com",
      phone: "+63 912 345 6789",
      address: "Villa Community",
      profilePicture: undefined,
      joinedDate: "Nov 1, 2024",
      emailVerified: true,
      status: "active",
    },
  },
  "demo@example.com": {
    password: "demo1234",
    user: {
      id: "user-002",
      name: "Demo User",
      email: "demo@example.com",
      phone: "+63 987 654 3210",
      address: "Villa City",
      profilePicture: undefined,
      joinedDate: "Nov 15, 2024",
      emailVerified: true,
      status: "active",
    },
  },
};

// Generate mock token
const generateToken = (): string => {
  return "token_" + Math.random().toString(36).substring(2, 15);
};

// Generate verification token for password reset
const generateResetToken = (): string => {
  return "reset_" + Math.random().toString(36).substring(2, 15);
};

// Get current session from localStorage
export const getCurrentSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (stored) {
    try {
      const session: AuthSession = JSON.parse(stored);
      // Check if token expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }
      return session;
    } catch (e) {
      console.error("Failed to parse auth session:", e);
      return null;
    }
  }
  return null;
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  const session = getCurrentSession();
  return session?.user || null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Login user - NOW CALLS BACKEND API
export const loginUser = async (
  credentials: AuthCredentials
): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
  if (typeof window === "undefined") {
    return { success: false, error: "Client-side only" };
  }

  const { email, password, rememberMe } = credentials;

  // Validate inputs
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email format" };
  }

  try {
    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe,
      }),
    });

    const result = await response.json();

    if (result.success && result.token) {
      // Convert backend response to AuthUser format
      const user: AuthUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        address: result.user.address || "",
        profilePicture: result.user.profilePicture,
        joinedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        emailVerified: true,
        status: "active",
      };

      // Save session to localStorage
      const session: AuthSession = {
        user,
        token: result.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        rememberMe: rememberMe || false,
      };

      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.token);

      if (rememberMe) {
        localStorage.setItem(AUTH_REMEMBER_KEY, email);
      }

      return { success: true, user };
    } else {
      return { success: false, error: result.error || "Login failed" };
    }
  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, error: "Failed to connect to server" };
  }
};

// Register user - NOW CALLS BACKEND API
export const registerUser = async (
  data: RegisterData
): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === "undefined") {
    return { success: false, error: "Client-side only" };
  }

  const errors = validateRegistration(data);
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors).join("; ");
    return { success: false, error: errorMessages };
  }

  try {
    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: "",
        address: "",
      }),
    });

    const result = await response.json();

    if (result.success && result.token) {
      // Save token and user to localStorage
      const session: AuthSession = {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone || "",
          address: result.user.address || "",
          profilePicture: result.user.profilePicture,
          joinedDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          emailVerified: true,
          status: "active",
        },
        token: result.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        rememberMe: false,
      };
      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.token);
      return { success: true };
    } else {
      return { success: false, error: result.error || "Registration failed" };
    }
  } catch (error) {
    console.error("Registration API error:", error);
    return { success: false, error: "Failed to connect to server" };
  }
};

// Logout user
export const logoutUser = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
};

// Request password reset
export const requestPasswordReset = (
  email: string
): { success: boolean; error?: string; message?: string } => {
  if (typeof window === "undefined") {
    return { success: false, error: "Client-side only" };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  // Check if user exists
  const userExists =
    DEMO_USERS[email.toLowerCase()] ||
    getRegisteredUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!userExists) {
    // Don't reveal if email exists (security best practice)
    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  }

  // Generate reset token and store with expiration (1 hour)
  const resetToken = generateResetToken();
  const resetData = {
    email: email.toLowerCase(),
    token: resetToken,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  localStorage.setItem(RESET_TOKEN_STORAGE_KEY, JSON.stringify(resetData));

  return {
    success: true,
    message: "Password reset link sent to your email (demo: token stored locally)",
  };
};

// Verify password reset token
export const verifyResetToken = (token: string): boolean => {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(RESET_TOKEN_STORAGE_KEY);
  if (!stored) return false;

  try {
    const resetData = JSON.parse(stored);
    // Check if token matches and hasn't expired
    return resetData.token === token && resetData.expiresAt > Date.now();
  } catch (e) {
    return false;
  }
};

// Get email from reset token
export const getResetTokenEmail = (): string | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(RESET_TOKEN_STORAGE_KEY);
  if (!stored) return null;

  try {
    const resetData = JSON.parse(stored);
    if (resetData.expiresAt > Date.now()) {
      return resetData.email;
    }
  } catch (e) {
    return null;
  }
  return null;
};

// Reset password with token
export const resetPassword = (
  reset: PasswordReset
): { success: boolean; error?: string } => {
  if (typeof window === "undefined") {
    return { success: false, error: "Client-side only" };
  }

  // Verify token
  if (!verifyResetToken(reset.token)) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  const email = getResetTokenEmail();
  if (!email) {
    return { success: false, error: "Reset token not found" };
  }

  // Validate new password
  const errors = validatePasswordReset(reset);
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors).join("; ");
    return { success: false, error: errorMessages };
  }

  // Update password in registered users
  const registeredUsers = getRegisteredUsers();
  const userIndex = registeredUsers.findIndex(
    (u) => u.email.toLowerCase() === email
  );

  if (userIndex !== -1) {
    registeredUsers[userIndex].password = reset.newPassword;
    saveRegisteredUsers(registeredUsers);
  }

  // Also update demo users (for demo accounts)
  if (DEMO_USERS[email]) {
    DEMO_USERS[email].password = reset.newPassword;
  }

  // Clear reset token
  localStorage.removeItem(RESET_TOKEN_STORAGE_KEY);

  return { success: true };
};

// Get remembered email
export const getRememberedEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_REMEMBER_KEY);
};

// Get registered users
export const getRegisteredUsers = (): (AuthUser & { password: string })[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse registered users:", e);
      return [];
    }
  }
  return [];
};

// Save registered users
export const saveRegisteredUsers = (
  users: (AuthUser & { password: string })[]
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
};

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password !== undefined && password !== null && password.length >= 6;
};

export interface RegistrationValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export const validateRegistration = (
  data: RegisterData
): RegistrationValidationErrors => {
  const errors: RegistrationValidationErrors = {};

  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = "Full name is required";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Name must be at least 2 characters";
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password || data.password.length === 0) {
    errors.password = "Password is required";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!data.confirmPassword || data.confirmPassword.length === 0) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!data.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms and conditions";
  }

  return errors;
};

export interface PasswordResetValidationErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export const validatePasswordReset = (
  reset: PasswordReset
): PasswordResetValidationErrors => {
  const errors: PasswordResetValidationErrors = {};

  if (!reset.newPassword || reset.newPassword.length === 0) {
    errors.newPassword = "Password is required";
  } else if (reset.newPassword.length < 6) {
    errors.newPassword = "Password must be at least 6 characters";
  }

  if (!reset.confirmPassword || reset.confirmPassword.length === 0) {
    errors.confirmPassword = "Please confirm your password";
  } else if (reset.confirmPassword !== reset.newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
