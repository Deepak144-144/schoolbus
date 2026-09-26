"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, Clock, MapPin } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

export interface BusStopInfo {
  id: string;
  stopName: string;
  latitude: number;
  longitude: number;
  estimatedTime: string | null;
  stopOrder: number;
  studentsToPick: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface StopListProps {
  stops: BusStopInfo[];
  currentStopId?: string;
  onMarkComplete?: (stopId: string) => void;
}

export function StopList({ stops, currentStopId, onMarkComplete }: StopListProps) {
  return (
    <Card className="border-border/30">
      <CardHeader>
        <CardTitle>Route Stops</CardTitle>
        <CardDescription>
          {stops.filter(s => s.isCompleted).length} of {stops.length} stops completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stops.map((stop, index) => {
            const isCurrent = stop.isCurrent || stop.id === currentStopId;
            const isCompleted = stop.isCompleted;

            return (
              <div
                key={stop.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  isCompleted
                    ? "bg-green-50/30"
                    : isCurrent
                    ? "bg-accent/10 border-2 border-accent"
                    : "bg-background hover:bg-secondary/5"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-accent text-white"
                    : "bg-secondary/20 text-secondary"
                )}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "font-medium",
                      isCompleted ? "text-secondary line-through" : "text-primary"
                    )}>
                      {stop.stopName}
                    </h4>
                    <Badge
                      variant={isCompleted ? "success" : isCurrent ? "primary" : "neutral"}
                      dot={isCurrent && !isCompleted}
                    >
                      {isCompleted ? "Done" : isCurrent ? "Current" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ETA: {stop.estimatedTime}
                    </span>
                    {stop.studentsToPick > 0 && (
                      <span>{stop.studentsToPick} students</span>
                    )}
                  </div>
                </div>

                {!isCompleted && isCurrent && onMarkComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => onMarkComplete(stop.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
