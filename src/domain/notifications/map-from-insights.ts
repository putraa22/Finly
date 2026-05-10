import type { DashboardInsight } from "@/domain/insights/types";
import { insightPriorityWeight } from "@/domain/insights/insight-priority-weights";

import type {
  FinlyNotification,
  NotificationKind,
} from "@/domain/notifications/types";
import {
  computeNotificationPriorityScore,
  deriveUiNotificationPriority,
} from "@/domain/notifications/priority-score";

/** Pemetaan insight id → jenis notifikasi (tier skor dihitung terpisah). */
const INSIGHT_NOTIFICATION_RULES: Readonly<
  Record<string, { kind: NotificationKind }>
> = {
  "daily-over-limit": { kind: "critical" },
  "balance-depleted": { kind: "critical" },
  "balance-runway": { kind: "warning" },
  "week-spike": { kind: "warning" },
  "food-category-heavy-month": { kind: "suggestion" },
  "savings-category-gap": { kind: "suggestion" },
  "safe-daily-calendar": { kind: "suggestion" },
  "daily-within-limit": { kind: "achievement" },
  "healthy-week-down": { kind: "achievement" },
  "savings-category-up": { kind: "achievement" },
  "pattern-late-night-spend": { kind: "suggestion" },
  "pattern-impulsive-shopping": { kind: "suggestion" },
  "pattern-impulsive-shopping-mom": { kind: "suggestion" },
  "pattern-week-spike": { kind: "suggestion" },
  "pattern-unstable-daily": { kind: "suggestion" },
  "pattern-saving-streak": { kind: "achievement" },
};

export function notificationsFromInsights(
  insights: DashboardInsight[],
): FinlyNotification[] {
  const out: FinlyNotification[] = [];

  for (const insight of insights) {
    if (insight.id === "fallback-empty") continue;
    const rule = INSIGHT_NOTIFICATION_RULES[insight.id];
    if (!rule) continue;

    const weight = insightPriorityWeight(insight.id);
    const priorityScore = computeNotificationPriorityScore(rule.kind, weight);
    const priority = deriveUiNotificationPriority(priorityScore);

    out.push({
      id: `notif-${insight.id}`,
      insightId: insight.id,
      kind: rule.kind,
      priorityScore,
      priority,
      title: insight.problem,
      body: insight.impact,
    });
  }

  out.sort((a, b) => {
    const ps = b.priorityScore - a.priorityScore;
    if (ps !== 0) return ps;
    return a.insightId.localeCompare(b.insightId);
  });

  return out;
}
