export const NUMPAD_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "000",
  "0",
  "back",
] as const;

export type NumpadKey = (typeof NUMPAD_KEYS)[number];

export const QUICK_AMOUNTS = [10_000, 25_000, 50_000, 100_000] as const;

/** Mock konteks perilaku — ganti dengan data real nanti */
export const MOCK_DAILY_LIMIT = 150_000;
export const MOCK_SPENT_TODAY = 62_000;
export const MOCK_FREQUENT_CATEGORY_IDS = ["food", "transport", "shopping"] as const;
export const MOCK_RECENT_CATEGORY_ID = "entertainment";

export const AI_SUGGEST_CATEGORY_ID = "food";

export const SUBMIT_REDIRECT_MS = 400;
export const AMOUNT_ANIM_MS = 350;
/** Jeda sebelum navigasi setelah sukses — selaras animasi nominal turun. */
export const SUCCESS_REDIRECT_MS = Math.max(SUBMIT_REDIRECT_MS, AMOUNT_ANIM_MS + 100);
export const MAX_AMOUNT_DIGITS = 12;

export type CoachTone = "tip" | "warn" | "good";

export type CoachCopy = Readonly<{
  tone: CoachTone;
  text: string;
}>;

export const COACH_BY_CATEGORY: Record<string, CoachCopy> = {
  food: {
    tone: "warn",
    text: "Pengeluaran makanan minggu ini sudah cukup tinggi.",
  },
  transport: {
    tone: "good",
    text: "Transport minggu ini lebih hemat dari biasanya 👍",
  },
  shopping: {
    tone: "warn",
    text: "Pembelian ini terlihat sedikit impulsif.",
  },
  bills: { tone: "tip", text: "Tagihan rutin — bagus, tetap konsisten." },
  entertainment: {
    tone: "tip",
    text: "Hiburan menyenangkan — tetap dalam batas wajar.",
  },
  health: { tone: "good", text: "Investasi kesehatan selalu worth it." },
  savings: { tone: "good", text: "Mantap, terus tambah tabunganmu! 💪" },
  other: { tone: "tip", text: "Catat semua, supaya insight makin akurat." },
};

export const CTA_LABEL_BY_CATEGORY: Record<string, string> = {
  food: "Catat pengeluaran makan 🍜",
  transport: "Catat biaya transport 🚕",
  shopping: "Catat belanja 🛍️",
  bills: "Catat tagihan 🧾",
  entertainment: "Catat hiburan 🎬",
  health: "Catat kesehatan 💊",
  savings: "Tambah ke tabungan 💰",
  other: "Simpan & perbarui insight",
};
