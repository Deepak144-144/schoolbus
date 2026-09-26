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

const typeIcons: Record<string, React.ReactNode> = {
  EMERGENCY: <AlertCircle className="h-4 w-4 text-emergency" />,
  DELAY: <Clock className="h-4 w-4 text-warning" />,
  SYSTEM: <Bell className="h-4 w-4 text-accent" />,
  BOARDED: <UserCheck className="h-4 w-4 text-accent" />,
  DEFAULT: <Bell className="h-4 w-4 text-accent" />,
};

export default async function DriverNotificationsPage() {
  const user = await getAuthUser("DRIVER");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-secondary/30 mx-auto mb-3" />
          <p className="text-secondary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const icon = typeIcons[n.type] || typeIcons.DEFAULT;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/30"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-primary">{n.title}</h3>
                    <span className="text-xs text-secondary whitespace-nowrap">
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-secondary mt-1">{n.message}</p>
                </div>
                {!n.readStatus && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
