"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, Trash2, Users, Mail, Phone } from "lucide-react";

interface ParentWithUser {
  id: string;
  userId: string;
  children: { id: string; name: string; class: string }[];
  user: { id: string; name: string; email: string; phone: string | null };
}

function EditParentForm({
  parent,
  onClose,
  deleteServerAction,
}: {
  parent: ParentWithUser;
  onClose: () => void;
  deleteServerAction: (formData: FormData) => void;
}) {
  return (
    <form action={deleteServerAction}>
      <input type="hidden" name="id" value={parent.id} />
      <input type="hidden" name="userId" value={parent.user.id} />
      <div className="space-y-4">
        <div>
          <Label>Parent Name</Label>
          <p className="text-sm font-medium text-primary mt-1">{parent.user.name}</p>
        </div>
        <div>
          <Label>Parent Email</Label>
          <p className="text-sm text-secondary mt-1">{parent.user.email}</p>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            name="phone"
            defaultValue={parent.user.phone || ""}
            placeholder="Phone number"
          />
        </div>
        <div>
          <Label>Children</Label>
          <p className="text-sm text-secondary mt-1">
            {parent.children.length} {parent.children.length === 1 ? "child" : "children"}
          </p>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="danger" className="flex-1">
          Delete Parent
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Close
        </Button>
      </div>
    </form>
  );
}

interface ParentsClientProps {
  parents: ParentWithUser[];
  deleteParent: (formData: FormData) => void;
}

export default function ParentsClient({ parents, deleteParent }: ParentsClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentWithUser | null>(null);

  const handleEditClick = (p: ParentWithUser) => {
    setEditingParent(p);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingParent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Parents</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => {}}>
          Add Parent (via registration)
        </Button>
      </div>

      {editingParent && (
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEdit}
          title={`Parent: ${editingParent.user.name}`}
          description="Manage parent account and children."
        >
          <EditParentForm parent={editingParent} onClose={handleCloseEdit} deleteServerAction={deleteParent} />
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {parents.map((parent) => (
          <Card key={parent.id} className="border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">{parent.user.name}</CardTitle>
              <CardDescription>{parent.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parent.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-primary">{parent.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-secondary">
                    {parent.children.length} {parent.children.length === 1 ? "child" : "children"}
                  </span>
                </div>
                {parent.children.length > 0 && (
                  <div>
                    <span className="text-xs text-secondary">Children:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parent.children.map((c) => (
                        <Badge key={c.id} variant="primary" className="text-xs">
                          {c.name} ({c.class})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex gap-2 p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditClick(parent)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <form
                action={deleteParent}
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to delete this parent? This cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={parent.id} />
                <input type="hidden" name="userId" value={parent.user.id} />
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
