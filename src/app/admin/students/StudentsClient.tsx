"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Users, Edit, Plus, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  section: string;
  parent: { id: string; user: { id: string; name: string; email: string } } | null;
  bus: { id: string; busNumber: string } | null;
  pickupStop: { id: string; stopName: string } | null;
  dropoffStop: { id: string; stopName: string } | null;
}

interface ParentOption {
  id: string;
  user: { name: string; email: string };
}

interface BusOption {
  id: string;
  busNumber: string;
}

interface StopOption {
  id: string;
  stopName: string;
  route: { routeName: string };
}

function StudentForm({
  student,
  parents,
  buses,
  stops,
  onClose,
  action,
}: {
  student?: Student;
  parents: ParentOption[];
  buses: BusOption[];
  stops: StopOption[];
  onClose: () => void;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      {student && <input type="hidden" name="id" value={student.id} />}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" required>
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Emma Garcia"
            defaultValue={student?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="studentId" required>
            Student ID
          </Label>
          <Input
            id="studentId"
            name="studentId"
            placeholder="e.g. STU-001"
            defaultValue={student?.studentId}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="class" required>
              Class
            </Label>
            <Input
              id="class"
              name="class"
              placeholder="e.g. 4th Grade"
              defaultValue={student?.class}
              required
            />
          </div>
          <div>
            <Label htmlFor="section" required>
              Section
            </Label>
            <Input
              id="section"
              name="section"
              placeholder="e.g. A"
              defaultValue={student?.section}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="parentId" required>
            Parent
          </Label>
          <select
            id="parentId"
            name="parentId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={student?.parent?.id || ""}
            required
          >
            <option value="">Select a parent</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user.name} ({p.user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="busId">
            Assign Bus
          </Label>
          <select
            id="busId"
            name="busId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={student?.bus?.id || ""}
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
          <Label htmlFor="pickupStopId">
            Pickup Stop
          </Label>
          <select
            id="pickupStopId"
            name="pickupStopId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={student?.pickupStop?.id || ""}
          >
            <option value="">No pickup</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stopName} ({s.route.routeName})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dropoffStopId">
            Drop-off Stop
          </Label>
          <select
            id="dropoffStopId"
            name="dropoffStopId"
            className="mt-1 block w-full px-3 py-2 border border-border/30 rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            defaultValue={student?.dropoffStop?.id || ""}
          >
            <option value="">No drop-off</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stopName} ({s.route.routeName})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {student ? "Save Changes" : "Add Student"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface StudentsClientProps {
  students: Student[];
  parents: ParentOption[];
  buses: BusOption[];
  stops: StopOption[];
  createStudent: (formData: FormData) => void;
  updateStudent: (formData: FormData) => void;
  deleteStudent: (formData: FormData) => void;
}

export default function StudentsClient({ students, parents, buses, stops, createStudent, updateStudent, deleteStudent }: StudentsClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleAddClick = () => setShowAddModal(true);
  const handleEditClick = (s: Student) => {
    setEditingStudent(s);
    setShowEditModal(true);
  };
  const handleCloseAdd = () => setShowAddModal(false);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Students</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddClick}>
          Add Student
        </Button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title="Add New Student"
        description="Enter the details for the new student."
      >
        <StudentForm
          parents={parents}
          buses={buses}
          stops={stops}
          onClose={handleCloseAdd}
          action={createStudent}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit Student"
        description="Update the student details."
      >
        <StudentForm
          student={editingStudent ?? undefined}
          parents={parents}
          buses={buses}
          stops={stops}
          onClose={handleCloseEdit}
          action={updateStudent}
        />
      </Modal>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 font-medium text-primary">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Parent</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Bus</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Pickup Stop</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border/20">
                    <td className="py-3 px-4 font-medium text-primary">{s.name}</td>
                    <td className="py-3 px-4 text-secondary">{s.studentId}</td>
                    <td className="py-3 px-4 text-secondary">{s.class} {s.section}</td>
                    <td className="py-3 px-4 text-secondary">{s.parent?.user?.name || "N/A"}</td>
                    <td className="py-3 px-4 text-secondary">
                      {s.bus ? (<Badge variant="primary">Bus {s.bus.busNumber}</Badge>) : "Unassigned"}
                    </td>
                    <td className="py-3 px-4 text-secondary">{s.pickupStop?.stopName || "N/A"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(s)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <form
                          action={deleteStudent}
                          onSubmit={(e) => {
                            if (!confirm("Are you sure you want to delete this student? This cannot be undone.")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
