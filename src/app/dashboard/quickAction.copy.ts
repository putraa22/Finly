import type { QuickActionId } from "@/src/components/dashboard";

export type QuickActionFeedbackCopy = {
  title: string;
  description: string;
};

export const QUICK_ACTION_FEEDBACK_COPY: Record<
  QuickActionId,
  QuickActionFeedbackCopy
> = {
  "auto-save": {
    title: "Aktifkan auto-save",
    description: "Lanjutkan di halaman terkait.",
  },
  "set-limit": {
    title: "Atur limit harianmu",
    description: "Lanjutkan di halaman terkait.",
  },
  challenge: {
    title: "Mulai challenge 7 hari",
    description: "Lanjutkan di halaman terkait.",
  },
  fix: {
    title: "Perbaiki pengeluaran",
    description: "Lanjutkan di halaman terkait.",
  },
};
