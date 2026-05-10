import type {
  NotificationKind,
  NotificationPriority,
} from "@/domain/notifications/types";

/** Rentang bobot engine insight untuk normalisasi ke dalam tier notifikasi. */
const ENGINE_WEIGHT_MIN = 40;
const ENGINE_WEIGHT_MAX = 115;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

const TIER_RANGE: Readonly<
  Record<NotificationKind, Readonly<{ floor: number; ceil: number }>>
> = {
  critical: { floor: 90, ceil: 100 },
  warning: { floor: 70, ceil: 89 },
  suggestion: { floor: 40, ceil: 69 },
  achievement: { floor: 20, ceil: 39 },
};

/**
 * Skor dalam rentang tier sesuai kind; bobot engine menentukan posisi dalam rentang.
 */
export function computeNotificationPriorityScore(
  kind: NotificationKind,
  insightEngineWeight: number,
): number {
  const { floor, ceil } = TIER_RANGE[kind];
  const span = ceil - floor;
  const w = clamp(
    insightEngineWeight,
    ENGINE_WEIGHT_MIN,
    ENGINE_WEIGHT_MAX,
  );
  const t =
    (w - ENGINE_WEIGHT_MIN) /
    Math.max(1, ENGINE_WEIGHT_MAX - ENGINE_WEIGHT_MIN);
  return Math.round(floor + t * span);
}

/** Chip / toast: satu sumber dari priorityScore. */
export function deriveUiNotificationPriority(
  priorityScore: number,
): NotificationPriority {
  if (priorityScore >= 70) return "high";
  if (priorityScore >= 45) return "medium";
  return "low";
}
