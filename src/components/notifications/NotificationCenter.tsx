"use client";

import { Bell, Check, X, AlertCircle, Bus, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, getTimeAgo } from "@/lib/utils";
import { NotificationData } from "@/lib/types";

const notificationIcons: Record<string, React.ReactElement> = {
  ROUTE_STARTED: <Bus className="h-4 w-4" />,
  BUS_APPROACHING: <Clock className="h-4 w-4" />,
  STOP_APPROACHING: <MapPin className="h-4 w-4" />,
  BOARDED: <User className="h-4 w-4" />,
  ARRIVED_SCHOOL: <Bus className="h-4 w-4" />,
  DROPPED_OFF: <Bus className="h-4 w-4" />,
  DELAY: <Clock className="h-4 w-4" />,
  BREAKDOWN: <AlertCircle className="h-4 w-4" />,
  EMERGENCY: <AlertCircle className="h-4 w-4" />,
  SYSTEM: <Bell className="h-4 w-4" />,
  GENERAL: <Bell className="h-4 w-4" />,
};

interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const icon = notificationIcons[notification.type] || <Bell className="h-4 w-4" />;

  const typeVariant = notification.type === "EMERGENCY"
    ? "danger"
    : notification.type === "DELAY" || notification.type === "BREAKDOWN"
    ? "warning"
    : "primary";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer",
        notification.read
          ? "bg-background hover:bg-secondary/5"
          : "bg-accent/5 border-l-2 border-accent",
        "border border-border/20"
      )}
      onClick={() => onMarkRead?.(notification.id)}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        `bg-${typeVariant === "danger" ? "red" : typeVariant === "warning" ? "amber" : "accent"}/10`
      )}>
        {notification.type === "EMERGENCY" ? (
          <span className="text-lg">🚨</span>
        ) : (
          <span className="text-accent">{icon}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm font-medium",
            notification.read ? "text-secondary" : "text-primary"
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-secondary whitespace-nowrap ml-2">
            {getTimeAgo(notification.timestamp)}
          </span>
        </div>
        <p className="text-sm text-secondary mt-1 line-clamp-2">
          {notification.message}
        </p>
        {!notification.read && (
          <Badge variant="primary" className="mt-1">
            New
          </Badge>
        )}
      </div>
    </div>
  );
}

interface NotificationCenterProps {
  notifications: NotificationData[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  maxVisible?: number;
}

export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onMarkRead,
  maxVisible = 5,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <Card className="border-border/30">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h3 className="font-semibold text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="danger" dot>
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {visibleNotifications.length === 0 ? (
          <div className="p-6 text-center text-secondary">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {visibleNotifications.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
        )}

        {unreadCount > 0 && onMarkAllRead && (
          <div className="p-3 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onMarkAllRead}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
