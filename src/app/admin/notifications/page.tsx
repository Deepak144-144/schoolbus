import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bell, AlertCircle, Clock, Bus, UserCheck, Check } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
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
  BREAKDOWN: <AlertCircle className="h-4 w-4 text-warning" />,
  ROUTE_STARTED: <Bus className="h-4 w-4 text-accent" />,
  BOARDED: <UserCheck className="h-4 w-4 text-accent" />,
  ARRIVED_SCHOOL: <Bus className="h-4 w-4 text-accent" />,
  DROPPED_OFF: <Bus className="h-4 w-4 text-accent" />,
  BUS_APPROACHING: <Clock className="h-4 w-4 text-accent" />,
  STOP_APPROACHING: <Clock className="h-4 w-4 text-accent" />,
  DEFAULT: <Bell className="h-4 w-4" />,
};

export default async function AdminNotificationsPage() {
  const user = await getAuthUser("ADMIN");

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">All Notifications</h1>
        <Badge variant="warning" dot>
          {unreadCount} unread
        </Badge>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-border/30">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-secondary/30 mx-auto mb-3" />
            <p className="text-secondary">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const icon = typeIcons[n.type] || typeIcons.DEFAULT;
            return (
              <Card key={n.id} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-primary">{n.title}</h3>
                          <p className="text-sm text-secondary mt-1">{n.message}</p>
                        </div>
                        <span className="text-xs text-secondary whitespace-nowrap ml-2">
                          {getTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="neutral" className="text-xs">
                          {n.type}
                        </Badge>
                        {!n.readStatus ? (
                          <Badge variant="primary" className="text-xs" dot>
                            Unread
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-xs">
                            Read
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
