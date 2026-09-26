"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, Trash2, MapPin, Clock, MapIcon } from "lucide-react";

interface RouteWithDetails {
  id: string;
  routeName: string;
  school: string;
  schoolLat: number;
  schoolLng: number;
  stops: {
    id: string;
    stopName: string;
    latitude: number;
    longitude: number;
    estimatedTime: string | null;
    stopOrder: number;
  }[];
  buses: { id: string; busNumber: string }[];
  _count: { stops: number; buses: number };
}

function RouteForm({
  route,
  onClose,
  action,
}: {
  route?: RouteWithDetails;
  onClose: () => void;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      {route && <input type="hidden" name="id" value={route.id} />}
      <div className="space-y-4">
        <div>
          <Label htmlFor="routeName" required>
            Route Name
          </Label>
          <Input
            id="routeName"
            name="routeName"
            placeholder="e.g. Route 1 - Morning"
            defaultValue={route?.routeName}
            required
          />
        </div>
        <div>
          <Label htmlFor="school" required>
            School Name
          </Label>
          <Input
            id="school"
            name="school"
            placeholder="e.g. Greenwood Elementary School"
            defaultValue={route?.school}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="schoolLat">
              School Latitude
            </Label>
            <Input
              id="schoolLat"
              name="schoolLat"
              type="number"
              step="0.0001"
              placeholder="e.g. 40.7580"
              defaultValue={route?.schoolLat || ""}
            />
          </div>
          <div>
            <Label htmlFor="schoolLng">
              School Longitude
            </Label>
            <Input
              id="schoolLng"
              name="schoolLng"
              type="number"
              step="0.0001"
              placeholder="e.g. -73.9855"
              defaultValue={route?.schoolLng || ""}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {route ? "Save Changes" : "Create Route"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface RoutesClientProps {
  routes: RouteWithDetails[];
  createRoute: (formData: FormData) => void;
  updateRoute: (formData: FormData) => void;
  deleteRoute: (formData: FormData) => void;
}

export default function RoutesClient({ routes, createRoute, updateRoute, deleteRoute }: RoutesClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteWithDetails | null>(null);

  const handleAddClick = () => setShowAddModal(true);
  const handleEditClick = (r: RouteWithDetails) => {
    setEditingRoute(r);
    setShowEditModal(true);
  };
  const handleCloseAdd = () => setShowAddModal(false);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Routes</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
          Create Route
        </Button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title="Create New Route"
        description="Enter the basic details for the new route."
      >
        <RouteForm
          onClose={handleCloseAdd}
          action={createRoute}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit Route"
        description="Update the route details."
      >
        <RouteForm
          route={editingRoute ?? undefined}
          onClose={handleCloseEdit}
          action={updateRoute}
        />
      </Modal>

      <div className="space-y-4">
        {routes.map((route) => (
          <Card key={route.id} className="border-border/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{route.routeName}</CardTitle>
                <Badge variant="primary">{route.buses.length} bus(es)</Badge>
              </div>
              <CardDescription>
                {route.school} • {route._count.stops} stops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-background rounded-xl">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm">
                    School: {route.school} ({route.schoolLat.toFixed(4)}, {route.schoolLng.toFixed(4)})
                  </span>
                </div>

                <div className="space-y-1">
                  {route.stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/5 transition-colors"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-accent">{stop.stopOrder}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{stop.stopName}</p>
                        <p className="text-xs text-secondary">
                          {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </p>
                      </div>
                      {stop.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-secondary" />
                          <span className="text-xs text-secondary">{stop.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex gap-2 p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditClick(route)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                <MapIcon className="h-3 w-3 mr-1" /> View on Map
              </Button>
              <form
                action={deleteRoute}
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to delete this route? This cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={route.id} />
                <Button type="submit" variant="danger" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
