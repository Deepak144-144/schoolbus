import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Save, Database, Shield, Bell } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminSettingsPage() {
  const busCount = await prisma.bus.count();
  const studentCount = await prisma.student.count();
  const driverCount = await prisma.driver.count();
  const parentCount = await prisma.parent.count();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Settings</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{busCount + studentCount}</p>
                <p className="text-sm text-secondary">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">
                  {process.env.DEMO_MODE === "true" ? "Demo" : "Live"}
                </p>
                <p className="text-sm text-secondary">Mode</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">8s</p>
                <p className="text-sm text-secondary">GPS Interval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure school transportation system</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" defaultValue="Greenwood Elementary School" />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@saferide.edu" />
              </div>
              <div>
                <Label htmlFor="gpsInterval">GPS Update Interval (seconds)</Label>
                <Input id="gpsInterval" type="number" defaultValue="8" />
              </div>
              <div>
                <Label htmlFor="defaultSpeed">Default Speed (km/h)</Label>
                <Input id="defaultSpeed" type="number" defaultValue="25" />
              </div>
            </div>
            <Button variant="primary" leftIcon={<Save className="h-4 w-4" />}>
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-accent">{busCount}</p>
              <p className="text-sm text-secondary">Buses</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-accent">{studentCount}</p>
              <p className="text-sm text-secondary">Students</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-accent">{driverCount}</p>
              <p className="text-sm text-secondary">Drivers</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-accent">{parentCount}</p>
              <p className="text-sm text-secondary">Parents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
