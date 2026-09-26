import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Bell, Clock, Bus, AlertCircle, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Notification {
  id: string;
  title: string;
  message: string;
      type: string;
      readStatus: boolean;
      createdAt: Date;
      relatedBusId?: string | null;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function getNotifications(userId: string): Promise<Notification[]> {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function markAllAsRead(userId: string) {
  "use server";
  await prisma.notification.updateMany({
    where: { userId, readStatus: false },
    data: { readStatus: true },
  });
}

export default async function ParentNotificationsPage() {
  const user = await getAuthUser("PARENT");
  const notifications = await getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllAsRead.bind(null, user.id)}>
            <button
              type="submit"
              className="text-sm text-accent hover:underline font-medium"
            >
              Mark all as read ({unreadCount})
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-secondary/30 mx-auto mb-3" />
          <p className="text-secondary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  const typeIcons: Record<string, React.ReactNode> = {
    BOARDED: <UserCheck className="h-4 w-4" />,
    ARRIVED_SCHOOL: <Bus className="h-4 w-4" />,
    DROPPED_OFF: <Bus className="h-4 w-4" />,
    EMERGENCY: <AlertCircle className="h-4 w-4" />,
    DELAY: <Clock className="h-4 w-4" />,
    BREAKDOWN: <AlertCircle className="h-4 w-4" />,
    ROUTE_STARTED: <Bus className="h-4 w-4" />,
    BUS_APPROACHING: <Clock className="h-4 w-4" />,
    STOP_APPROACHING: <MapPin className="h-4 w-4" />,
    DEFAULT: <Bell className="h-4 w-4" />,
  };

  const icon = typeIcons[notification.type] || typeIcons.DEFAULT;
  const iconColor =
    notification.type === "EMERGENCY"
      ? "text-emergency"
      : notification.type === "DELAY" || notification.type === "BREAKDOWN"
      ? "text-warning"
      : "text-accent";
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/30 transition-all hover:shadow-md"
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-primary">{notification.title}</h3>
          <span className="text-xs text-secondary whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <p className="text-sm text-secondary mt-1">{notification.message}</p>
      </div>
      {!notification.readStatus && (
        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
      )}
    </div>
  );
}

import { MapPin } from "lucide-react";
