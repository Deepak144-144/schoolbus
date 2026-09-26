import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { User, Phone, Mail, Shield, Bell, Save } from "lucide-react";
import { hashPassword } from "@/lib/auth/hash";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parent: true,
    },
  });
}

async function updateProfile(userId: string, data: {
  name: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  "use server";

  const user = await getAuthUser("PARENT");
  const updateData: { name?: string; phone?: string; password?: string } = {};

  if (data.name) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  if (data.newPassword && data.currentPassword) {
    const bcrypt = await import("bcryptjs");
    const profileForAuth = await getProfile(user.id);
    if (!profileForAuth) throw new Error("Profile not found");
    const isValid = await bcrypt.compare(data.currentPassword, profileForAuth.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
    const hashed = await hashPassword(data.newPassword);
    updateData.password = hashed;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}

export default async function ParentProfilePage() {
  const user = await getAuthUser("PARENT");
  const profile = await getProfile(user.id);

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">Profile not found.</p>
      </div>
    );
  }

  const childCount = profile.parent ? await prisma.student.count({
    where: { parentId: profile.parent.id }
  }) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Profile</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-xl font-semibold text-primary">{profile.name}</p>
                <Badge variant="primary">{profile.role}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-primary">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <Shield className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary">
                  {childCount} {childCount === 1 ? "child" : "children"} registered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 xl:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your account information and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              "use server";
              const name = formData.get("name") as string;
              const phone = formData.get("phone") as string;
              const currentPassword = formData.get("currentPassword") as string;
              const newPassword = formData.get("newPassword") as string;

              try {
                await updateProfile(user.id, {
                  name,
                  phone,
                  currentPassword: currentPassword || undefined,
                  newPassword: newPassword || undefined,
                });
              } catch (error: any) {
                console.error(error);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" required>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone || ""}
                  />
                </div>
              </div>

              <div className="border-t border-border/30 pt-4 space-y-3">
                <h4 className="font-medium text-primary">Change Password</h4>
                <div>
                  <Label htmlFor="currentPassword">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
