export type NotificationPriority = "high" | "medium" | "low";

export type NotificationKind =
  | "critical"
  | "warning"
  | "suggestion"
  | "achievement";

export type FinlyNotification = Readonly<{
  id: string;
  insightId: string;
  kind: NotificationKind;
  /** Skor numerik untuk urutan stabil (critical 90+, warning 70+, suggestion 40+, achievement 20+). */
  priorityScore: number;
  /** Ringkas untuk chip UI — diturunkan dari priorityScore. */
  priority: NotificationPriority;
  title: string;
  body: string;
  /** ISO timestamp when mapped (optional, untuk versi berikutnya). */
  createdAt?: string;
}>;
