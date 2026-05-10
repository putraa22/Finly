# Finly App

Aplikasi web personal finance berbasis **Next.js (App Router)** dengan dashboard, insight, simulasi cepat, dan notifikasi yang diurutkan secara deterministik. Data transaksi disimpan di **PostgreSQL** lewat **Prisma**.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, Radix / shadcn-style UI, Framer Motion
- Prisma 7 + adapter `pg`
- Zustand (UI dashboard ringan)

## Prasyarat

- Node.js 20+ (disarankan)
- PostgreSQL dan string koneksi (`DATABASE_URL`)

## Setup

```bash
npm install
```

Pastikan `.env` berisi minimal:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Lalu sinkronkan schema dan generate client Prisma (sesuaikan dengan workflow kamu, mis. `prisma migrate dev` atau `db push`):

```bash
npx prisma generate
# npx prisma migrate dev
```

Jalankan pengembangan:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman utama aplikasi mengarah ke alur dashboard/transaksi sesuai routing di `src/app`.

### Skrip NPM

| Skrip | Keterangan |
|--------|------------|
| `npm run dev` | Server pengembangan Next.js |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | ESLint |

## Variabel lingkungan (opsional)

Selain `DATABASE_URL`, banyak perilaku bisnis memakai env dengan fallback default. Cuplikan yang sering dipakai:

| Variabel | Peran singkat |
|----------|----------------|
| `STARTING_BALANCE` | Saldo awal untuk saldo tampilan (`0` jika kosong) |
| `MONTHLY_INCOME`, `MONTHLY_BUDGET` | Pendapatan / budget bulanan |
| `MONTHLY_SAVINGS_GOAL` | Target tabungan (override proporsi default) |
| `DAILY_SPENDING_LIMIT` | Limit insight harian |
| `SPIKE_WEEK_PCT` | Ambang lonjakan minggu vs minggu lalu |
| `MAX_INSIGHTS` | Jumlah insight di dashboard |
| `SIMULATOR_DEFAULT_FOOD_SHARE` | Default proporsi makan untuk simulasi |

Insight lain memakai env seperti `FOOD_MONTH_SHARE_ALERT`, `HEALTHY_WEEK_DROP_PCT`, dll.; lihat pemanggilan di `src/domain/insights/` dan `get-dashboard-summary.ts`.

## Struktur kode (ringkas)

- `src/app/` — route UI (App Router)
- `src/application/` — use case orkestrasi (mis. ringkasan dashboard)
- `src/domain/` — logika murni: finance, insights, notifications
- `src/infrastructure/` — query persistence (Prisma)
- `src/components/` — komponen React
- `src/lib/` — barrel kompatibilitas impor (Prisma client, re-export domain)

## Fitur utama

- **Financial Health Score** — skor kesehatan finansial dengan alasan (stabilitas, tabungan, ritme belanja, mix kategori).
- **Pattern detection** — pola belanja (malam hari, spike, streak tabungan, dll.) digabung ke pipeline insight.
- **Mini simulator** — slider hemat makan / tambah tabungan; pratinjau runway dan dampak ke health score secara realtime di client.
- **Notifikasi prioritas** — skor numerik per tier (`critical`, `warning`, `suggestion`, `achievement`) untuk urutan stabil.
- **Metrik turunan dashboard** — burn harian, pace budget aman, velocity vs budget, proyeksi akhir bulan / runway (tersentral di domain finance).

## Deploy

Deploy seperti aplikasi Next.js biasa (mis. [Vercel](https://vercel.com) atau Node adapter). Pastikan `DATABASE_URL` dan migrasi database terset di lingkungan produksi.

## Lisensi

Private project (`"private": true` di `package.json`).
