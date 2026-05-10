import { getDashboardSummary } from "@/lib/dashboard/summary";

import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  return <DashboardClient summary={summary} />;
}
