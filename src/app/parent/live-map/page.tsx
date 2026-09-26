import { getDashboardData } from "@/lib/data/parent-data";
import { LiveMapPage } from "@/components/parent/LiveMapPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ParentLiveMapRoute() {
  const data = await getDashboardData();

  if (!data || !data.bus || !data.bus.route) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No active bus route found.</p>
      </div>
    );
  }

  return (
    <LiveMapPage
      bus={data.bus}
      child={data.children[0]}
      childStops={data.childStops}
      userId={data.user.id}
    />
  );
}