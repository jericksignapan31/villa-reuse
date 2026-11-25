// Notification system with localStorage persistence

export type NotificationType = 
  | "new_request"
  | "request_accepted"
  | "request_rejected"
  | "transaction_completed"
  | "item_updated"
  | "message";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedItemId?: number;
  relatedRequestId?: number;
  relatedUserId?: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

// Storage key
export const NOTIFICATIONS_STORAGE_KEY = "notifications";

// Generate unique notification ID
export const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Notification templates with icons
const notificationTemplates: Record<NotificationType, { icon: string; title: (data: any) => string; message: (data: any) => string }> = {
  new_request: {
    icon: "📬",
    title: (data) => `New Request from ${data.requesterName}`,
    message: (data) => `Someone requested your "${data.itemName}" item. Check the details to accept or reject.`,
  },
  request_accepted: {
    icon: "✅",
    title: (data) => `Request Accepted!`,
    message: (data) => `Your request for "${data.itemName}" has been accepted! Get ready for pickup.`,
  },
  request_rejected: {
    icon: "❌",
    title: (data) => `Request Rejected`,
    message: (data) => `Your request for "${data.itemName}" has been rejected. Try another item!`,
  },
  transaction_completed: {
    icon: "🎉",
    title: (data) => `Transaction Completed`,
    message: (data) => `Your exchange for "${data.itemName}" is complete. Rate this transaction!`,
  },
  item_updated: {
    icon: "🔄",
    title: (data) => `Item Updated`,
    message: (data) => `"${data.itemName}" status changed to ${data.status}.`,
  },
  message: {
    icon: "💬",
    title: (data) => `New Message`,
    message: (data) => data.messageText || "You have a new message.",
  },
};

// Create notification from template
export const createNotification = (
  type: NotificationType,
  data: any
): Notification => {
  const template = notificationTemplates[type];
  return {
    id: generateNotificationId(),
    type,
    title: template.title(data),
    message: template.message(data),
    icon: template.icon,
    relatedItemId: data.itemId,
    relatedRequestId: data.requestId,
    relatedUserId: data.userId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

// Load notifications from localStorage
export const loadNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse notifications:", e);
      return [];
    }
  }
  return [];
};

// Save notifications to localStorage
export const saveNotifications = (notifications: Notification[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
};

// Add new notification
export const addNotification = (notification: Notification): void => {
  const notifications = loadNotifications();
  notifications.unshift(notification); // Add to beginning
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  
  saveNotifications(notifications);
};

// Mark notification as read
export const markAsRead = (notificationId: string): void => {
  const notifications = loadNotifications();
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    saveNotifications(notifications);
  }
};

// Mark all as read
export const markAllAsRead = (): void => {
  const notifications = loadNotifications();
  notifications.forEach((n) => {
    n.isRead = true;
  });
  saveNotifications(notifications);
};

// Delete notification
export const deleteNotification = (notificationId: string): void => {
  const notifications = loadNotifications();
  const filtered = notifications.filter((n) => n.id !== notificationId);
  saveNotifications(filtered);
};

// Delete all notifications
export const deleteAllNotifications = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
};

// Get statistics
export const getNotificationStats = (): NotificationStats => {
  const notifications = loadNotifications();
  
  const stats: NotificationStats = {
    total: notifications.length,
    unread: 0,
    byType: {
      new_request: 0,
      request_accepted: 0,
      request_rejected: 0,
      transaction_completed: 0,
      item_updated: 0,
      message: 0,
    },
  };

  notifications.forEach((notification) => {
    if (!notification.isRead) {
      stats.unread++;
    }
    stats.byType[notification.type]++;
  });

  return stats;
};

// Get unread count
export const getUnreadCount = (): number => {
  const notifications = loadNotifications();
  return notifications.filter((n) => !n.isRead).length;
};

// Get notifications by type
export const getNotificationsByType = (type: NotificationType): Notification[] => {
  const notifications = loadNotifications();
  return notifications.filter((n) => n.type === type);
};

// Add demo notifications (for testing)
export const addDemoNotifications = (): void => {
  const demoNotifications: Notification[] = [
    {
      id: generateNotificationId(),
      type: "new_request",
      title: "New Request from Sarah Johnson",
      message: 'Someone requested your "Office Chair" item. Check the details to accept or reject.',
      relatedItemId: 1,
      relatedRequestId: 101,
      relatedUserId: "user-002",
      icon: "📬",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    },
    {
      id: generateNotificationId(),
      type: "request_accepted",
      title: "Request Accepted!",
      message: 'Your request for "Wooden Table" has been accepted! Get ready for pickup.',
      relatedItemId: 2,
      relatedRequestId: 102,
      relatedUserId: "user-003",
      icon: "✅",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    },
    {
      id: generateNotificationId(),
      type: "transaction_completed",
      title: "Transaction Completed",
      message: 'Your exchange for "Electric Fan" is complete. Rate this transaction!',
      relatedItemId: 3,
      relatedRequestId: 103,
      relatedUserId: "user-004",
      icon: "🎉",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    },
  ];

  demoNotifications.forEach((notification) => {
    addNotification(notification);
  });
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
