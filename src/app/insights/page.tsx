import { getDashboardSummary } from "@/lib/dashboard/summary";

import { InsightsClient } from "./InsightsClient";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const summary = await getDashboardSummary();
  return <InsightsClient insightsAll={summary.insightsAll} />;
}
