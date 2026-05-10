/** Ringkas: Rp…jt / Rp…rb / Rp… (nilai negatif tetap dapat prefiks −). */
export function formatIDR(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const jt = abs / 1_000_000;
    return `${sign}Rp${jt.toFixed(abs % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${Math.round(abs / 1_000)}rb`;
  }
  return `${sign}Rp${abs}`;
}

export function formatIDRFull(n: number) {
  return `Rp${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;
}
