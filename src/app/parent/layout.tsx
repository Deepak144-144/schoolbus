import { ParentSidebar, MobileNav } from "@/components/layout/Sidebar";
import { getAuthUser } from "@/lib/auth/server";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser("PARENT");

  return (
    <div className="flex min-h-screen bg-background">
      <ParentSidebar user={user} />
      <div className="flex-1 flex flex-col pb-16 lg:pb-0">
        <MobileNav />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 sm:px-6 py-6 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
