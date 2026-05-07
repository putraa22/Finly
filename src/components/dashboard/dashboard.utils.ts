export function formatIDR(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return (
    sign +
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(abs)
  );
}

export function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

