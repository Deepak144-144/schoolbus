import { AdminSidebar } from "@/components/layout/Sidebar";
import { getAuthUser } from "@/lib/auth/server";
import { Bell } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser("ADMIN");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border/30 bg-card/50 px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-primary">School Admin Panel</h1>
          <Link href="/admin/notifications">
            <button className="relative p-2 text-secondary hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-emergency rounded-full flex items-center justify-center text-xs text-white">
                0
              </span>
            </button>
          </Link>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 sm:px-6 py-6 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
