/**
 * Konfigurasi kanal media sosial yang dipantau.
 * Dipakai untuk menentukan warna, ikon, dan endpoint pengambilan data.
 */
export const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@tirtapakuan.id',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg,#F9CE34,#EE2A7B 48%,#6228D7)',
    weight: 1.25,
  },
  {
    id: 'x',
    name: 'X / Twitter',
    handle: '@TirtaPakuan',
    color: '#1D9BF0',
    gradient: 'linear-gradient(135deg,#1D9BF0,#0B7FB4)',
    weight: 1.1,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Tirta Pakuan',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg,#1877F2,#0B4FA8)',
    weight: 1.0,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@tirtapakuan',
    color: '#00F2EA',
    textColor: '#111',
    gradient: 'linear-gradient(135deg,#00F2EA,#FE2C55 55%,#000)',
    weight: 1.35,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'Tirta Pakuan Official',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg,#FF0000,#8B0000)',
    weight: 0.75,
  },
  {
    id: 'website',
    name: 'Website & Review',
    handle: 'tirtapakuan.co.id',
    color: '#10B981',
    gradient: 'linear-gradient(135deg,#10B981,#0E7490)',
    weight: 0.6,
  },
]

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]))

/** Rentang filter periode yang tersedia */
export const PERIODS = [
  { id: '7d', label: '7 Hari', days: 7 },
  { id: '30d', label: '30 Hari', days: 30 },
  { id: '90d', label: '90 Hari', days: 90 },
]

/** Sentimen & labelnya */
export const SENTIMENTS = {
  positif: { id: 'positif', label: 'Positif', color: '#22C55E', icon: '▲' },
  netral: { id: 'netral', label: 'Netral', color: '#94A3B8', icon: '●' },
  negatif: { id: 'negatif', label: 'Negatif', color: '#EF4444', icon: '▼' },
}

export const TOPICS = [
  'Kualitas Air',
  'Tagihan & Pembayaran',
  'Layanan Pelanggan',
  'Pipa Bocor',
  'Tekanan Air',
  'Pengaduan',
  'Promo & Diskon',
  'Jadwal Distribusi',
]