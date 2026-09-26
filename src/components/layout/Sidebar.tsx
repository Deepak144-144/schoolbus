"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Bell,
  Users,
  User,
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  Bus,
  Route,
  Building,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "./NavLink";

interface AdminSidebarProps {
  user: { id: string; name: string; email: string; role: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border/30 bg-card p-4 lg:flex">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-primary">SafeRide Admin</span>
      </div>

      <nav className="space-y-1">
        <NavLink href="/admin" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
        <NavLink href="/admin/schools" label="Schools" icon={<Building className="h-4 w-4" />} />
        <NavLink href="/admin/students" label="Students" icon={<Users className="h-4 w-4" />} />
        <NavLink href="/admin/parents" label="Parents" icon={<Users className="h-4 w-4" />} />
        <NavLink href="/admin/buses" label="Buses" icon={<Bus className="h-4 w-4" />} />
        <NavLink href="/admin/drivers" label="Drivers" icon={<Shield className="h-4 w-4" />} />
        <NavLink href="/admin/routes" label="Routes" icon={<Route className="h-4 w-4" />} />
        <NavLink href="/admin/fleet" label="Fleet Tracking" icon={<Map className="h-4 w-4" />} />
        <NavLink href="/admin/notifications" label="Notifications" icon={<Bell className="h-4 w-4" />} />
        <NavLink href="/admin/settings" label="Settings" icon={<Settings className="h-4 w-4" />} />
      </nav>

      <div className="mt-auto pt-4 border-t border-border/30">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            window.location.href = '/auth/login'
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}

interface ParentSidebarProps {
  user: { id: string; name: string; email: string; role: string };
}

export function ParentSidebar({ user }: ParentSidebarProps) {
  return (
    <aside className="hidden w-0.25 min-w-[240px] flex-shrink-0 flex-col border-r border-border/30 bg-card p-4 lg:flex">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-primary">SafeRide Parent</span>
      </div>

      <nav className="space-y-1">
        <NavLink href="/parent" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
        <NavLink href="/parent/live-map" label="Live Map" icon={<Map className="h-4 w-4" />} />
        <NavLink href="/parent/notifications" label="Notifications" icon={<Bell className="h-4 w-4" />} />
        <NavLink href="/parent/child" label="My Child" icon={<Users className="h-4 w-4" />} />
        <NavLink href="/parent/profile" label="Profile" icon={<Settings className="h-4 w-4" />} />
      </nav>

      <div className="mt-auto pt-4 border-t border-border/30">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            window.location.href = '/auth/login'
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}

interface DriverSidebarProps {
  user: { id: string; name: string; email: string; role: string };
}

export function DriverSidebar({ user }: DriverSidebarProps) {
  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border/30 bg-card p-4 lg:flex">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
          <Bus className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-primary">SafeRide Driver</span>
      </div>

      <nav className="space-y-1">
        <NavLink href="/driver" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
        <NavLink href="/driver/trips" label="Trip History" icon={<Route className="h-4 w-4" />} />
        <NavLink href="/driver/notifications" label="Notifications" icon={<Bell className="h-4 w-4" />} />
        <NavLink href="/driver/profile" label="Profile" icon={<Settings className="h-4 w-4" />} />
      </nav>

      <div className="mt-auto pt-4 border-t border-border/30">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            window.location.href = '/auth/login'
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/30 lg:hidden">
      <div className="flex items-center justify-around py-2">
        <Link href="/parent" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent">
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/parent/live-map" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent">
          <Map className="h-5 w-5" />
          <span>Live Map</span>
        </Link>
        <Link href="/parent/notifications" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent relative">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </Link>
        <Link href="/parent/child" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent">
          <User className="h-5 w-5" />
          <span>Child</span>
        </Link>
      </div>
    </nav>
  );
}

export function MobileDriverNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/30 lg:hidden">
      <div className="flex items-center justify-around py-2">
        <Link href="/driver" className="flex flex-col items-center gap-0.5 py-2 text-xs text-accent">
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/driver/trips" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent">
          <Route className="h-5 w-5" />
          <span>Trips</span>
        </Link>
        <Link href="/driver/profile" className="flex flex-col items-center gap-0.5 py-2 text-xs text-secondary hover:text-accent">
          <Settings className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
