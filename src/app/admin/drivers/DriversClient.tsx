"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, Trash2 } from "lucide-react";

interface DriverWithUser {
  id: string;
  userId: string;
  licenseInfo: string | null;
  assignedBusId: string | null;
  status: string;
  user: { name: string; email: string; phone: string | null };
  assignedBus: { id: string; busNumber: string } | null;
}

const driverStatuses = ["AVAILABLE", "ON_ROUTE", "ON_BREAK", "OFFLINE"];

function DriverForm({
  driver,
  users,
  buses,
  onClose,
  action,
}: {
  driver?: DriverWithUser;
  users: { id: string; name: string; email: string }[];
  buses: { id: string; busNumber: string }[];
  onClose: () => void;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      {driver && <input type="hidden" name="id" value={driver.id} />}
      <div className="space-y-4">
        <div>
          <Label htmlFor="userId" required>
            User Account
          </Label>
          <select
            id="userId"
            name="userId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={driver?.userId || ""}
            required
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="licenseInfo">
            License Information
          </Label>
          <Input
            id="licenseInfo"
            name="licenseInfo"
            placeholder="e.g. DL-12345678"
            defaultValue={driver?.licenseInfo || ""}
          />
        </div>
        <div>
          <Label htmlFor="assignedBusId">
            Assign Bus
          </Label>
          <select
            id="assignedBusId"
            name="assignedBusId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={driver?.assignedBusId || ""}
          >
            <option value="">Unassigned</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                Bus {b.busNumber}
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
            defaultValue={driver?.status || "OFFLINE"}
          >
            {driverStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {driver ? "Save Changes" : "Add Driver"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface DriversClientProps {
  drivers: DriverWithUser[];
  allUsers: { id: string; name: string; email: string }[];
  allBuses: { id: string; busNumber: string }[];
  createDriver: (formData: FormData) => void;
  updateDriver: (formData: FormData) => void;
  deleteDriver: (formData: FormData) => void;
}

export default function DriversClient({ drivers, allUsers, allBuses, createDriver, updateDriver, deleteDriver }: DriversClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverWithUser | null>(null);

  const handleAddClick = () => setShowAddModal(true);
  const handleEditClick = (d: DriverWithUser) => {
    setEditingDriver(d);
    setShowEditModal(true);
  };
  const handleCloseAdd = () => setShowAddModal(false);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingDriver(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Drivers</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
          Add Driver
        </Button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title="Add New Driver"
        description="Enter the details for the new driver."
      >
        <DriverForm
          users={allUsers}
          buses={allBuses}
          onClose={handleCloseAdd}
          action={createDriver}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit Driver"
        description="Update the driver details."
      >
        <DriverForm
          driver={editingDriver ?? undefined}
          users={allUsers}
          buses={allBuses}
          onClose={handleCloseEdit}
          action={updateDriver}
        />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="border-border/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{driver.user.name}</CardTitle>
                <Badge
                  variant={
                    driver.status === "ON_ROUTE" ? "success"
                    : driver.status === "AVAILABLE" ? "info"
                    : driver.status === "ON_BREAK" ? "warning"
                    : "neutral"
                  }
                  dot
                >
                  {driver.status}
                </Badge>
              </div>
              <CardDescription>{driver.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Phone</span>
                  <span className="text-sm font-medium text-primary">
                    {driver.user.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">License</span>
                  <span className="text-sm font-medium text-primary">
                    {driver.licenseInfo || "Not on file"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Assigned Bus</span>
                  <span className="text-sm font-medium text-primary">
                    {driver.assignedBus ? `Bus ${driver.assignedBus.busNumber}` : "Unassigned"}
                  </span>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditClick(driver)}
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <form
                  action={deleteDriver}
                  onSubmit={(e) => {
                    if (!confirm("Are you sure you want to delete this driver? This cannot be undone.")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={driver.id} />
                  <Button type="submit" variant="danger" size="sm" className="flex-1">
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
