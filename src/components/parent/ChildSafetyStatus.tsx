"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, getStatusIcon } from "@/lib/utils";
import { ChildSafetyStatus } from "@/lib/types";
import {
  Bus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Truck,
  School,
  Home,
} from "lucide-react";

const safetySteps: Array<{
  key: ChildSafetyStatus;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "waiting", label: "Waiting for pickup", icon: <Clock className="h-4 w-4" /> },
  { key: "approaching", label: "Bus approaching", icon: <Bus className="h-4 w-4" /> },
  { key: "boarded", label: "Child boarded", icon: <CheckCircle className="h-4 w-4" /> },
  { key: "arrived_school", label: "Arrived at school", icon: <School className="h-4 w-4" /> },
  { key: "returning", label: "Returning home", icon: <Truck className="h-4 w-4" /> },
  { key: "dropped_off", label: "Child dropped off", icon: <Home className="h-4 w-4" /> },
];

interface ChildSafetyStatusProps {
  status: ChildSafetyStatus;
  childName: string;
}

export function ChildSafetyStatusCard({ status, childName }: ChildSafetyStatusProps) {
  const statusConfig: Record<ChildSafetyStatus, { label: string; color: string; bgColor: string }> = {
    waiting: { label: "Waiting for pickup", color: "text-secondary", bgColor: "bg-secondary/10" },
    approaching: { label: "Bus approaching", color: "text-blue-600", bgColor: "bg-blue-50" },
    boarded: { label: "Safe - Child Boarded", color: "text-green-600", bgColor: "bg-green-50" },
    arrived_school: { label: "Arrived at school", color: "text-green-600", bgColor: "bg-green-50" },
    returning: { label: "Returning home", color: "text-amber-600", bgColor: "bg-amber-50" },
    dropped_off: { label: "Child dropped off", color: "text-green-600", bgColor: "bg-green-50" },
    emergency: { label: "EMERGENCY", color: "text-white", bgColor: "bg-emergency" },
  };

  const config = statusConfig[status];
  const currentStepIndex = safetySteps.findIndex((s) => s.key === status);

  return (
    <Card className="border-border/30">
      <CardHeader>
        <CardTitle className="text-lg">Child Safety Status</CardTitle>
        <CardDescription>
          Real-time status for {childName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            config.bgColor
          )}>
            {getStatusIcon(status)}
          </div>
          <div>
            <p className="font-semibold text-primary text-lg">{config.label}</p>
          </div>
        </div>

        <div className="space-y-2">
          {safetySteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl transition-all",
                  isCurrent
                    ? "bg-accent/10 border border-accent"
                    : isCompleted
                    ? "bg-green-50/30"
                    : "opacity-50"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-accent text-white"
                    : "bg-secondary/20 text-secondary"
                )}>
                  {isCompleted ? <CheckCircle className="h-3 w-3" /> : step.icon}
                </div>
                <span className={cn(
                  "text-sm",
                  isCompleted ? "text-green-700" : isCurrent ? "text-accent font-medium" : "text-secondary"
                )}>
                  {step.label}
                </span>
                {isCurrent && (
                  <Badge variant="success" dot className="ml-auto">
                    Current
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
