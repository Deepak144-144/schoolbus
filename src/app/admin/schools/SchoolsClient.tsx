"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, Trash2, School, MapPin, Trash } from "lucide-react";

interface SchoolWithRelations {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  owner: { id: string; user: { name: string; email: string } } | null;
  routes: { id: string; routeName: string }[];
  _count: { routes: number };
  createdAt: Date;
  updatedAt: Date;
}

interface SchoolsClientProps {
  schools: SchoolWithRelations[];
  currentAdminId: string | null;
  createSchool: (formData: FormData) => void;
  updateSchool: (formData: FormData) => void;
  deleteSchool: (formData: FormData) => void;
}

export default function SchoolsClient({ schools, currentAdminId, createSchool, updateSchool, deleteSchool }: SchoolsClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolWithRelations | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolWithRelations | null>(null);

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (school: SchoolWithRelations) => {
    setEditingSchool(school);
    setShowEditModal(true);
  };

  const handleDeleteClick = (school: SchoolWithRelations) => {
    setDeletingSchool(school);
  };

  const handleCloseAdd = () => setShowAddModal(false);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingSchool(null);
  };
  const handleConfirmDelete = () => {
    setDeletingSchool(null);
  };
  const handleCancelDelete = () => {
    setDeletingSchool(null);
  };

  const isOwner = (school: SchoolWithRelations) => school.owner?.id === currentAdminId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Schools</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
          Add School
        </Button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title="Add New School"
        description="Enter the school details."
      >
        <SchoolForm
          onClose={handleCloseAdd}
          action={createSchool}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit School"
        description="Update the school details."
      >
        <SchoolForm
          school={editingSchool ?? undefined}
          onClose={handleCloseEdit}
          action={updateSchool}
        />
      </Modal>

      <Modal
        isOpen={!!deletingSchool}
        onClose={handleCancelDelete}
        title="Delete School"
        description="This action cannot be undone. All routes must be removed first."
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const res = await fetch(`/api/schools?id=${deletingSchool?.id}`, { method: "DELETE" });
                if (res.ok) {
                  handleConfirmDelete();
                  window.location.reload();
                }
              }}
              disabled={!deletingSchool}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete School
            </Button>
          </div>
        }
      >
        {deletingSchool && (
          <div className="space-y-2 text-sm">
            <p className="text-secondary">
              Are you sure you want to delete <strong className="text-foreground">{deletingSchool.name}</strong>?
            </p>
            {deletingSchool._count.routes > 0 && (
              <p className="text-emergency text-sm">
                This school has {deletingSchool._count.routes} route(s) and cannot be deleted until they are removed.
              </p>
            )}
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => (
          <Card key={school.id} className="border-border/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-primary truncate">{school.name}</h3>
                    {school.owner && isOwner(school) && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        Your School
                      </span>
                    )}
                  </div>
                  {(school.latitude && school.longitude) && (
                    <p className="text-sm text-secondary flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}
                    </p>
                  )}
                  {school.routes.length > 0 && (
                    <p className="text-sm text-secondary mt-1">
                      {school._count.routes} route{school._count.routes !== 1 ? "s" : ""} configured
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(school)}
                    disabled={!isOwner(school)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(school)}
                    disabled={!isOwner(school) || school._count.routes > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {schools.length === 0 && (
          <Card className="border-border/30 col-span-full">
            <CardContent className="p-12 text-center">
              <School className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No schools yet</h3>
              <p className="text-secondary mb-4">Create your first school to get started</p>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
                Add School
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SchoolForm({
  school,
  onClose,
  action,
}: {
  school?: SchoolWithRelations;
  onClose: () => void;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      {school && <input type="hidden" name="id" value={school.id} />}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" required>
            School Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Greenwood Elementary School"
            defaultValue={school?.name}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="40.7580"
              defaultValue={school?.latitude ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="-73.9855"
              defaultValue={school?.longitude ?? ""}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {school ? "Save Changes" : "Add School"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}