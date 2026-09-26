"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bus, GraduationCap, Clock, Calendar, MapPin } from "lucide-react";

interface ChildInfoCardProps {
  child: {
    id: string;
    name: string;
    studentId: string;
    class: string;
    section: string;
    busNumber: string;
    pickupStop: string;
    dropoffStop: string;
    pickupTime: string;
    expectedArrival: string;
  };
  index?: number;
}

export function ChildInfoCard({ child, index = 0 }: ChildInfoCardProps) {
  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{child.name}</CardTitle>
          <Badge variant="primary">{child.studentId}</Badge>
        </div>
        <CardDescription>
          {child.class} • Section {child.section}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Bus Number</span>
            </div>
            <span className="text-sm font-medium text-primary">Bus {child.busNumber}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Pickup Time</span>
            </div>
            <span className="text-sm font-medium text-primary">{child.pickupTime}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Expected Arrival</span>
            </div>
            <span className="text-sm font-medium text-primary">{child.expectedArrival}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Pickup Stop</span>
            </div>
            <span className="text-sm font-medium text-primary">{child.pickupStop}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Drop-off Stop</span>
            </div>
            <span className="text-sm font-medium text-primary">{child.dropoffStop}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
