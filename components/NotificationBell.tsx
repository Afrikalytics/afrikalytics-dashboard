"use client";

// =============================================================================
// Datatym AI Dashboard — NotificationBell Component
// =============================================================================
// Bell icon with unread badge + dropdown showing latest notifications.
// Polls every 30 seconds for unread count.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { Notification, NotificationListResponse } from "@/lib/types";
import { ROUTES } from "@/lib/constants";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Icon color by notification type */
function getTypeColor(type: string): string {
  switch (type) {
    case "study_created":
      return "bg-blue-100 text-blue-600";
    case "insight_generated":
      return "bg-amber-100 text-amber-600";
    case "payment_confirmed":
      return "bg-green-100 text-green-600";
    case "anomaly_detected":
      return "bg-red-100 text-red-600";
    case "system":
    default:
      return "bg-surface-100 text-surface-600";
  }
}

/** Format relative time in French */
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.get<{ unread_count: number }>(
        "/api/notifications/unread-count"
      );
      setUnreadCount(data.unread_count);
    } catch {
      // Silently fail — non-critical
    }
  }, []);

  // Fetch latest notifications (when dropdown opens)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NotificationListResponse>(
        "/api/notifications?limit=5"
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch {
      // Silently fail
    }
  };

  // Mark single as read
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-50 transition-colors duration-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-surface-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-surface-400">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-500">
                  Aucune notification
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors ${
                    !notification.is_read ? "bg-primary-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.is_read ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          notification.is_read
                            ? "text-surface-600"
                            : "text-surface-900 font-medium"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-2xs text-surface-400 mt-1">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="shrink-0 mt-2">
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-surface-100">
            <a
              href={ROUTES.NOTIFICATIONS}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-surface-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Voir toutes les notifications
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
