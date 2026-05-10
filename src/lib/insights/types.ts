/** Selaras dengan chip/warna di `CoachInsight`; hindari impor komponen dari route ringan. */
export type InsightCoachTone = "warning" | "tip" | "win" | "urgent";

/** Selaras dengan `QuickActionId` di dashboard (toast stub). */
export type InsightQuickActionId = "auto-save" | "set-limit" | "challenge" | "fix";

export type InsightKind =
  | "warning"
  | "encouragement"
  | "spending_awareness"
  | "behavioral_feedback";

/** Satu kartu insight siap render sebagai `CoachInsight`. */
export type DashboardInsight = Readonly<{
  id: string;
  kind: InsightKind;
  tone: InsightCoachTone;
  priority?: "high";
  problem: string;
  impact: string;
  action: string;
  quickAction?: InsightQuickActionId;
}>;
