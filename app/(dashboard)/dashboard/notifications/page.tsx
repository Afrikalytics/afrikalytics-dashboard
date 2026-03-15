"use client";

// =============================================================================
// Afrikalytics Dashboard — Notifications Page
// =============================================================================
// Full list of user notifications with filtering, pagination, and mark-as-read.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  CreditCard,
  AlertTriangle,
  Info,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Notification, NotificationListResponse } from "@/lib/types";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PAGE_SIZE = 15;

type FilterStatus = "all" | "unread" | "read";

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "unread", label: "Non lues" },
  { value: "read", label: "Lues" },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getTypeIcon(type: string) {
  switch (type) {
    case "study_created":
      return FileText;
    case "insight_generated":
      return Lightbulb;
    case "payment_confirmed":
      return CreditCard;
    case "anomaly_detected":
      return AlertTriangle;
    case "system":
    default:
      return Info;
  }
}

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

function getTypeLabel(type: string): string {
  switch (type) {
    case "study_created":
      return "Etude";
    case "insight_generated":
      return "Insight";
    case "payment_confirmed":
      return "Paiement";
    case "anomaly_detected":
      return "Anomalie";
    case "system":
    default:
      return "Systeme";
  }
}

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
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default function NotificationsPage() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NotificationListResponse>(
        `/api/notifications?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}&status=${filter}`
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      setTotal(data.total);
    } catch {
      // Error handled by API service
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filter]);

  // Mark single as read
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      // If was unread, decrease count
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filters */}
      <div role="group" aria-label="Filtrer les notifications" className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f.value
                ? "bg-primary-600 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-surface-400">
            Chargement des notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-surface-200 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">
              {filter === "unread"
                ? "Aucune notification non lue"
                : filter === "read"
                  ? "Aucune notification lue"
                  : "Aucune notification"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !notification.is_read
                    ? "bg-primary-50/20 hover:bg-primary-50/40"
                    : "hover:bg-surface-50"
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`shrink-0 mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                    notification.type
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-sm leading-snug ${
                          notification.is_read
                            ? "text-surface-700"
                            : "text-surface-900 font-semibold"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <span
                        className={`inline-block mt-1 text-2xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {getTypeLabel(notification.type)}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-surface-400 whitespace-nowrap">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1.5 mt-1">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      aria-label="Marquer comme lue"
                      title="Marquer comme lue"
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Supprimer la notification"
                    title="Supprimer"
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-surface-500">
            Page {page + 1} sur {totalPages} ({total} notification{total > 1 ? "s" : ""})
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Precedent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
