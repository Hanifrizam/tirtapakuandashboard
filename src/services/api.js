/**
 * Lapisan pengambilan data dummy.
 *
 * Pada versi produksi, fungsi di sini akan memanggil API media sosial
 * (Graph API, X API, TikTok Research API, YouTube Data API) lewat backend
 * proxy. Untuk now, data disimulasikan dengan Promise + delay agar
 * alur "loading -> data masuk" di dashboard tetap realistis.
 */
import { buildPresepsiData } from '../data/dummyData.js'
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Ambil rekap seluruh kanal untuk satu periode. */
export async function fetchDashboard(days, seed) {
  await delay(600 + Math.random() * 400)
  return buildPresepsiData(days, seed)
}

/** Ambil data satu kanal saja. */
export async function fetchPlatform(platformId, days, seed) {
  await delay(350 + Math.random() * 300)
  const data = buildPresepsiData(days, seed)
  const platform = PLATFORM_MAP[platformId]
  if (!platform) return data

  const stat = data.byPlatform.find((p) => p.platformId === platformId)
  return {
    ...data,
    totals: {
      mentions: stat.mentions,
      positif: stat.positif,
      netral: stat.netral,
      negatif: stat.negatif,
      engagement: stat.engagement,
      reach: stat.reach,
      responseRate: stat.responseRate,
      netSentiment: Number(
        (((stat.positif - stat.negatif) / Math.max(1, stat.mentions)) * 100).toFixed(1)
      ),
      engagementRate: Number(
        ((stat.engagement / Math.max(1, stat.mentions)) * 2).toFixed(1)
      ),
    },
    byPlatform: data.byPlatform.filter((p) => p.platformId === platformId),
    mentions: data.mentions.filter((m) => m.platformId === platformId),
    platforms: [platform],
  }
}

/** Daftar kanal untuk kartu navigasi. */
export function listPlatforms() {
  return PLATFORMS
}