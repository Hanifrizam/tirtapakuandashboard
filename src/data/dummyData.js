import { PLATFORMS, SENTIMENTS, TOPICS } from './platforms.js'

/* ------------------------------------------------------------------ *
 * Generator angka acak deterministik (LCG) supaya data dummy stabil:
 * nilai tidak "berjumping" saat komponen re-render, tapi tetap bisa
 * diacak ulang lewat seed ketika tombol "Tarik Data" ditekan.
 * ------------------------------------------------------------------ */
function createRandom(seed) {
  let state = seed >>> 0 || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)]

const randInt = (rand, min, max) => Math.floor(rand() * (max - min + 1)) + min

const AUTHORS = [
  'Rina Kusuma',
  'Dimas Anggara',
  'Nur Aisyah',
  'Bagus Prasetyo',
  'Siti Rahma',
  'Andi Wijaya',
  'Dewi Lestari',
  'Fajar Nugroho',
  'Rizky Maulana',
  'Intan Permata',
  'Agus Salim',
  'Tika Permatasari',
  'Yusuf Maulana',
  'Putri Amelia',
  'Hendra Gunawan',
  'Lina Marlina',
  'Reza Fadillah',
  'Mira Handayani',
  'Bambang Setyo',
  'Novi Triana',
]

const LOCATIONS = [
  'Bandung',
  'Cimahi',
  'Bandung Barat',
  'Kab. Bandung',
  'Sumedang',
  'Garut',
  'Purwakarta',
  'Subang',
]

const CONTENT = {
  positif: [
    'Terima kasih Tirta Pakuan, air di {loc} akhirnya normal lagi!',
    'Respon pengaduan Tirta Pakuan cepat sekali, mantap 👍',
    'Pelayanan di {loc} makin bagus, petugasnya juga makin ramah.',
    'Salut Tirta Pakuan, sekarang distribusi air tepat waktu!',
    'Gara-gara perbaikan pipa, semua warga {loc} senang lagi.',
    'Petugas Tirta Pakuan profesional dan cepat merespons 👍',
    'Air di {loc} sudah jernih lagi, terima kasih!',
    'Senang bisa akses air bersih setiap hari, terima kasih Tirta Pakuan 😊',
  ],
  netral: [
    'Informasi jadwal distribusi air di {loc} berapa ya?',
    'Ada promo Tirta Pakuan untuk pelanggan bulan ini?',
    'Tagihan air bisa dicek lewat aplikasi atau website ya?',
    'Kapan jadwal distribusi air di {loc} berikutnya?',
    'Mau tanya alur pengajuan sambungan baru bagaimana?',
    'Nomor CS Tirta Pakuan yang aktif adalah berapa?',
    'Berapa tarif air per meter kubik sekarang?',
    'Apakah Tirta Pakuan melayani zona {loc} yang baru?',
  ],
  negatif: [
    'Air di {loc} sudah tidak mengalir 3 hari! 😡',
    'Tirta Pakuan lambat sekali menangani pengaduan, parah!',
    'Pipa air di {loc} bocor terus sejak seminggu lalu!',
    'Sudah lapor pipa bocor tapi sampai sekarang belum diperbaiki!',
    'Tekanan air di {loc} naik turun dan tidak stabil.',
    'Tagihan air naik gila tapi kualitas airnya tidak bagus.',
    'Sudah lapor kebocoran tapi tidak ada respons sama sekali.',
    'Air di {loc} keruh sekali pagi ini, tidak layak minum.',
  ],
}

const TOPIC_BY_SENTIMENT = {
  positif: ['Kualitas Air', 'Promo & Diskon', 'Layanan Pelanggan', 'Pipa Bocor'],
  netral: ['Jadwal Distribusi', 'Tagihan & Pembayaran', 'Promo & Diskon'],
  negatif: [
    'Pipa Bocor',
    'Kualitas Air',
    'Tagihan & Pembayaran',
    'Layanan Pelanggan',
    'Tekanan Air',
    'Pengaduan',
  ],
}

/** Tanggal acuan supaya tampilan deterministik (tidak ikut zona waktu user). */
const TODAY = new Date('2026-10-05T08:00:00+07:00')

/**
 * Membangun kumpulan data presepsi dummy dari seluruh kanal.
 * @param {number} days jumlah hari ke belakang
 * @param {number} seed  seed acak, diubah saat tombol "Tarik Data" ditekan
 */
export function buildPresepsiData(days = 30, seed = 20261005) {
  const rand = createRandom(seed * 31 + days)

  /* ---------- 1. Deret waktu harian per platform ---------- */
  const timeline = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(TODAY)
    date.setDate(TODAY.getDate() - i)

    const dow = date.getDay()
    const weekendBoost = dow === 0 || dow === 6 ? 1.35 : 1
    // Beberapa hari ada lonjakan (insetif Pho:-tuning air/normalisasi)
    const spike = i === 3 || i === 16 ? 1.9 : 1

    const day = {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      total: 0,
      positif: 0,
      netral: 0,
      negatif: 0,
      engagement: 0,
    }

    for (const p of PLATFORMS) {
      const base = 13 * p.weight * weekendBoost * spike
      const value = Math.max(2, Math.round(base + (rand() - 0.35) * base * 0.8))
      day[p.id] = value
      day.total += value
    }

    const mixPos = 0.55 + (rand() - 0.5) * 0.12
    const mixNeg = spike > 1 ? 0.28 : 0.12
    day.positif = Math.round(day.total * mixPos)
    day.negatif = Math.round(day.total * mixNeg)
    day.netral = Math.max(0, day.total - day.positif - day.negatif)
    day.engagement = Math.round(day.total * (2.4 + rand() * 3.6))

    timeline.push(day)
  }

  /* ---------- 2. Agregasi per platform ---------- */
  const byPlatform = PLATFORMS.map((p) => {
    const mentions = timeline.reduce((sum, d) => sum + d[p.id], 0)
    const posShare = p.id === 'youtube' || p.id === 'website' ? 0.72 : 0.56
    const negShare = p.id === 'tiktok' ? 0.24 : 0.13
    const positif = Math.round(mentions * posShare)
    const negatif = Math.round(mentions * negShare)
    const netral = Math.max(0, mentions - positif - negatif)

    return {
      platformId: p.id,
      mentions,
      positif,
      netral,
      negatif,
      engagement: Math.round(mentions * (p.weight > 1 ? 5.2 : 2.6)),
      responseRate: Math.round(62 + rand() * 30),
      reach: Math.round(mentions * (40 + rand() * 90)),
      trendPct: Math.round((3 + rand() * 24) * (rand() > 0.45 ? 1 : -1)),
    }
  })

  const totals = byPlatform.reduce(
    (acc, p) => {
      acc.mentions += p.mentions
      acc.positif += p.positif
      acc.netral += p.netral
      acc.negatif += p.negatif
      acc.engagement += p.engagement
      acc.reach += p.reach
      return acc
    },
    { mentions: 0, positif: 0, netral: 0, negatif: 0, engagement: 0, reach: 0 }
  )

  totals.responseRate = Math.round(
    byPlatform.reduce((sum, p) => sum + p.responseRate, 0) / byPlatform.length
  )
  totals.netSentiment = Number(
    (((totals.positif - totals.negatif) / Math.max(1, totals.mentions)) * 100).toFixed(1)
  )
  totals.engagementRate = Number(
    ((totals.engagement / Math.max(1, totals.mentions)) * 2).toFixed(1)
  )

  /* ---------- 3. Topik teratas ---------- */
  const topics = TOPICS.map((topic) => {
    const base = Math.round(totals.mentions * (0.08 + rand() * 0.16))
    const negatif = Math.round(base * (topic === 'Kualitas Air' ? 0.26 : 0.15))
    const netral = Math.round(base * 0.24)
    return {
      topic,
      mentions: base,
      negatif,
      netral,
      positif: Math.max(0, base - netral - negatif),
    }
  }).sort((a, b) => b.mentions - a.mentions)

  /* ---------- 4. Post/mention terbaru ---------- */
  const mentions = []
  const recentDays = Math.min(days, 14)
  for (let i = 0; i < 40; i += 1) {
    const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)]
    const sentiment = pickWeightedSentiment(rand)
    const day = timeline[timeline.length - 1 - Math.floor(rand() * recentDays)]

    mentions.push({
      id: `M${1024 + i}`,
      platformId: platform.id,
      platformName: platform.name,
      author: pick(rand, AUTHORS),
      location: pick(rand, LOCATIONS),
      sentiment,
      topic: pick(rand, TOPIC_BY_SENTIMENT[sentiment]),
      text: pick(rand, CONTENT[sentiment]).replace('{loc}', pick(rand, LOCATIONS)),
      likes: randInt(rand, 0, 480),
      comments: randInt(rand, 0, 96),
      shares: randInt(rand, 0, 140),
      replied: sentiment !== 'negatif' ? rand() > 0.45 : rand() > 0.75,
      date: day.date,
      label: day.label,
    })
  }
  mentions.sort((a, b) => (a.date < b.date ? 1 : -1))

  return { days, timeline, byPlatform, totals, topics, mentions, sentimentScale: SENTIMENTS }
}

function pickWeightedSentiment(rand) {
  const r = rand()
  if (r < 0.52) return 'positif'
  if (r < 0.8) return 'netral'
  return 'negatif'
}

export default buildPresepsiData