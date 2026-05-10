/** Awal bulan kalender lokal. */
export function startOfCalendarMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export function startOfPreviousCalendarMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
}

/** Awal hari kalender lokal (limit harian / agregasi “hari ini”). */
export function startOfCalendarDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** Senin 00:00 minggu yang berisi `now` (ISO-style week, Senin pertama). */
export function startOfMondayWeek(now: Date): Date {
  const copy = startOfCalendarDay(now);
  const dow = copy.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

export function calendarDaysInMonth(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Sisa hari kalender bulan ini, menghitung hari ini (minimal 1). */
export function daysLeftInCalendarMonth(now: Date): number {
  const lastDay = calendarDaysInMonth(now);
  const d = now.getDate();
  return Math.max(1, lastDay - d + 1);
}
