"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, Trash2, Save } from "lucide-react";

interface BusWithRelations {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  status: string;
  driver: { id: string; userId: string; user: { name: string } } | null;
  route: { id: string; routeName: string } | null;
  lastGpsUpdate: Date | null;
  currentLat: number | null;
  currentLng: number | null;
  _count: { students: number };
}

interface DriverOption {
  id: string;
  userId: string;
  user: { name: string };
}

interface RouteOption {
  id: string;
  routeName: string;
}

const busStatuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"];

function BusForm({
  bus,
  drivers,
  routes,
  onClose,
  action,
}: {
  bus?: BusWithRelations;
  drivers: DriverOption[];
  routes: RouteOption[];
  onClose: () => void;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      {bus && <input type="hidden" name="id" value={bus.id} />}
      <div className="space-y-4">
        <div>
          <Label htmlFor="busNumber" required>
            Bus Number
          </Label>
          <Input
            id="busNumber"
            name="busNumber"
            placeholder="e.g. 12"
            defaultValue={bus?.busNumber}
            required
          />
        </div>
        <div>
          <Label htmlFor="registrationNumber" required>
            Registration Number
          </Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            placeholder="e.g. ABC-1234"
            defaultValue={bus?.registrationNumber}
            required
          />
        </div>
        <div>
          <Label htmlFor="capacity">
            Capacity (seats)
          </Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            placeholder="40"
            defaultValue={bus?.capacity || 40}
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="driverId">
            Assign Driver
          </Label>
          <select
            id="driverId"
            name="driverId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={bus?.driver?.id || ""}
          >
            <option value="">Unassigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="routeId">
            Assign Route
          </Label>
          <select
            id="routeId"
            name="routeId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={bus?.route?.id || ""}
          >
            <option value="">No Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={bus?.status || "ACTIVE"}
          >
            {busStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {bus ? "Save Changes" : "Add Bus"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface BusesClientProps {
  buses: BusWithRelations[];
  drivers: DriverOption[];
  routes: RouteOption[];
  createBus: (formData: FormData) => void;
  updateBus: (formData: FormData) => void;
  deleteBus: (formData: FormData) => void;
}

export default function BusesClient({ buses, drivers, routes, createBus, updateBus, deleteBus }: BusesClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusWithRelations | null>(null);

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (bus: BusWithRelations) => {
    setEditingBus(bus);
    setShowEditModal(true);
  };

  const handleCloseAdd = () => setShowAddModal(false);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingBus(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Buses</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
          Add Bus
        </Button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title="Add New Bus"
        description="Enter the details for the new bus."
      >
        <BusForm
          drivers={drivers}
          routes={routes}
          onClose={handleCloseAdd}
          action={createBus}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit Bus"
        description="Update the bus details."
      >
        <BusForm
          bus={editingBus ?? undefined}
          drivers={drivers}
          routes={routes}
          onClose={handleCloseEdit}
          action={updateBus}
        />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <Card key={bus.id} className="border-border/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Bus {bus.busNumber}</CardTitle>
                <Badge
                  variant={
                    bus.status === "ACTIVE" ? "success"
                      : bus.status === "MAINTENANCE" ? "warning"
                      : bus.status === "INACTIVE" ? "danger"
                      : "neutral"
                  }
                  dot
                >
                  {bus.status}
                </Badge>
              </div>
              <CardDescription>Reg: {bus.registrationNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Driver</span>
                  <span className="text-sm font-medium text-primary">
                    {bus.driver?.user?.name || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Route</span>
                  <span className="text-sm font-medium text-primary">
                    {bus.route?.routeName || "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Capacity</span>
                  <span className="text-sm font-medium text-primary">{bus.capacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Students</span>
                  <span className="text-sm font-medium text-primary">{bus._count.students} assigned</span>
                </div>
                {bus.lastGpsUpdate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Last GPS</span>
                    <span className="text-xs text-secondary">
                      {bus.currentLat && bus.currentLng
                        ? `${bus.currentLat.toFixed(4)}, ${bus.currentLng.toFixed(4)}`
                        : "Calculating..."}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex gap-2 p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditClick(bus)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <form
                action={deleteBus}
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to delete this bus? This cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={bus.id} />
                <Button type="submit" variant="danger" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
