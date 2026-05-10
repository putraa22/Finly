import type { DashboardInsight } from "@/lib/insights/types";

import type {
  FinlyNotification,
  NotificationKind,
  NotificationPriority,
} from "@/lib/notifications/types";

const PRIORITY_RANK: Record<NotificationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Pemetaan insight id → tipe notifikasi + prioritas (selaras plan PRIORITAS #2). */
const INSIGHT_NOTIFICATION_RULES: Readonly<
  Record<string, { kind: NotificationKind; priority: NotificationPriority }>
> = {
  "daily-over-limit": { kind: "warning", priority: "high" },
  "balance-depleted": { kind: "warning", priority: "high" },
  "week-spike": { kind: "warning", priority: "high" },
  "balance-runway": { kind: "warning", priority: "high" },
  "food-category-heavy-month": { kind: "suggestion", priority: "medium" },
  "savings-category-gap": { kind: "suggestion", priority: "medium" },
  "safe-daily-calendar": { kind: "suggestion", priority: "medium" },
  "daily-within-limit": { kind: "achievement", priority: "low" },
  "healthy-week-down": { kind: "achievement", priority: "low" },
  "savings-category-up": { kind: "achievement", priority: "low" },
};

export function notificationsFromInsights(
  insights: DashboardInsight[],
): FinlyNotification[] {
  const out: FinlyNotification[] = [];

  for (const insight of insights) {
    if (insight.id === "fallback-empty") continue;
    const rule = INSIGHT_NOTIFICATION_RULES[insight.id];
    if (!rule) continue;

    out.push({
      id: `notif-${insight.id}`,
      insightId: insight.id,
      kind: rule.kind,
      priority: rule.priority,
      title: insight.problem,
      body: insight.impact,
    });
  }

  out.sort((a, b) => {
    const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pr !== 0) return pr;
    return a.insightId.localeCompare(b.insightId);
  });

  return out;
}
