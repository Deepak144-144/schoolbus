import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { User, Phone, Mail, Shield, Save } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const updateProfile = async (formData: FormData) => {
  "use server";
  const user = await getAuthUser("DRIVER");
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const licenseInfo = formData.get("licenseInfo") as string;

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone },
  });

  const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
  if (driver) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { licenseInfo },
    });
  }
};

export default async function DriverProfilePage() {
  const user = await getAuthUser("DRIVER");
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { driver: { include: { assignedBus: true } } },
  });
  const driver = profile?.driver;
  const bus = driver?.assignedBus;

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Profile</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-xl font-semibold text-primary">{profile.name}</p>
                <p className="text-sm text-secondary">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-secondary">{profile.phone || "Not set"}</span>
              </div>
              <div className="flex gap-2">
                <Shield className="h-4 w-4 text-secondary" />
                <span className="text-secondary">License: {driver?.licenseInfo || "Not on file"}</span>
              </div>
              {bus && (
                <div className="flex gap-2">
                  <User className="h-4 w-4 text-secondary" />
                  <span className="text-secondary">Assigned: Bus {bus.busNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 xl:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div>
                <Label htmlFor="name" required>Full Name</Label>
                <Input id="name" name="name" defaultValue={profile.name} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={profile.phone || ""} />
              </div>
              <div>
                <Label htmlFor="licenseInfo">License Information</Label>
                <Input id="licenseInfo" name="licenseInfo" defaultValue={driver?.licenseInfo || ""} />
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
