export type NotificationPriority = "high" | "medium" | "low";

export type NotificationKind = "warning" | "suggestion" | "achievement";

export type FinlyNotification = Readonly<{
  id: string;
  insightId: string;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  /** ISO timestamp when mapped (optional, untuk versi berikutnya). */
  createdAt?: string;
}>;
