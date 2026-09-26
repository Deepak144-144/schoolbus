import { Suspense } from "react";
import { getDashboardData } from "@/lib/data/parent-data";
import { ParentDashboardView } from "@/components/parent/ParentDashboardView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ParentDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No children found for this account.</p>
      </div>
    );
  }

  return <ParentDashboardView data={data} />;
}