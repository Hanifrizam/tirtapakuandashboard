import { useEffect, useMemo, useState } from 'react'
import ChartCanvas from './components/ChartCanvas.jsx'
import { AuthorAvatar, PlatformCard, SentimentBar, StatCard } from './components/Cards.jsx'
import { PERIODS, PLATFORMS, PLATFORM_MAP, SENTIMENTS } from './data/platforms.js'
import { fetchDashboard, fetchPlatform } from './services/api.js'

const nf = new Intl.NumberFormat('id-ID')

export default function App() {
  const [period, setPeriod] = useState('30d')
  const [platformId, setPlatformId] = useState(null)
  const [seed, setSeed] = useState(20261005)
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [query, setQuery] = useState('')

  const days = useMemo(
    () => PERIODS.find((p) => p.id === period)?.days ?? 30,
    [period]
  )

  // Tarik data setiap kali periode / kanal / seed berubah
  useEffect(() => {
    let alive = true
    setStatus('loading')

    const source = platformId
      ? fetchPlatform(platformId, days, seed)
      : fetchDashboard(days, seed)

    source.then((result) => {
      if (!alive) return
      setData(result)
      setStatus('ready')
    })

    return () => {
      alive = false
    }
  }, [days, seed, platformId])

  const activePlatform = platformId ? PLATFORM_MAP[platformId] : null

  // Filter mention sesuai sentiment pencarian
  const mentions = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.mentions.filter((m) => {
      const matchSentiment = sentimentFilter === 'all' || m.sentiment === sentimentFilter
      const matchQuery =
        q === '' ||
        m.text.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      return matchSentiment && matchQuery
    })
  }, [data, sentimentFilter, query])

  /* ---------------- Charts ---------------- */

  const trendChart = useMemo(() => {
    if (!data) return null
    return {
      type: 'line',
      data: {
        labels: data.timeline.map((d) => d.label),
        datasets: [
          {
            label: 'Positif',
            data: data.timeline.map((d) => d.positif),
            borderColor: SENTIMENTS.positif.color,
            backgroundColor: 'rgba(34,197,94,.15)',
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Netral',
            data: data.timeline.map((d) => d.netral),
            borderColor: SENTIMENTS.netral.color,
            backgroundColor: 'rgba(148,163,184,.12)',
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Negatif',
            data: data.timeline.map((d) => d.negatif),
            borderColor: SENTIMENTS.negatif.color,
            backgroundColor: 'rgba(239,68,68,.15)',
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: lineOptions,
    }
  }, [data])

  const donutChart = useMemo(() => {
    if (!data) return null
    return {
      type: 'doughnut',
      data: {
        labels: ['Positif', 'Netral', 'Negatif'],
        datasets: [
          {
            data: [data.totals.positif, data.totals.netral, data.totals.negatif],
            backgroundColor: [
              SENTIMENTS.positif.color,
              SENTIMENTS.netral.color,
              SENTIMENTS.negatif.color,
            ],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94A3B8', usePointStyle: true, padding: 16 },
          },
        },
      },
    }
  }, [data])

  const platformBarChart = useMemo(() => {
    if (!data) return null
    return {
      type: 'bar',
      data: {
        labels: data.byPlatform.map((p) => PLATFORM_MAP[p.platformId].name),
        datasets: [
          {
            label: 'Positif',
            data: data.byPlatform.map((p) => p.positif),
            backgroundColor: SENTIMENTS.positif.color,
            borderRadius: 6,
            stack: 's',
          },
          {
            label: 'Netral',
            data: data.byPlatform.map((p) => p.netral),
            backgroundColor: SENTIMENTS.netral.color,
            borderRadius: 6,
            stack: 's',
          },
          {
            label: 'Negatif',
            data: data.byPlatform.map((p) => p.negatif),
            backgroundColor: SENTIMENTS.negatif.color,
            borderRadius: 6,
            stack: 's',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8', usePointStyle: true } } },
        scales: {
          x: { stacked: true, ticks: { color: '#94A3B8' }, grid: { display: false } },
          y: {
            stacked: true,
            ticks: { color: '#94A3B8' },
            grid: { color: 'rgba(148,163,184,.12)' },
          },
        },
      },
    }
  }, [data])

  const sparkCharts = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries(
      data.byPlatform.map((p) => [
        p.platformId,
        {
          type: 'line',
          data: {
            labels: data.timeline.map((d) => d.label),
            datasets: [
              {
                data: data.timeline.map((d) => d[p.platformId]),
                borderColor: PLATFORM_MAP[p.platformId].color,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: false,
              },
            ],
          },
          options: sparkOptions,
        },
      ])
    )
  }, [data])

  /* ---------------- Render ---------------- */

  return (
    <div className="app-shell">
      <Sidebar
        platforms={PLATFORMS}
        activeId={platformId}
        onSelect={setPlatformId}
      />

      <main className="main">
        <Topbar
          platform={activePlatform}
          period={period}
          onPeriodChange={setPeriod}
          onRefresh={() => setSeed(Math.floor(Math.random() * 1e6))}
          loading={status === 'loading'}
          lastSync={lastSyncLabel(status, data)}
        />

        {status === 'loading' || !data ? (
          <LoadingState />
        ) : (
          <>
            <section className="kpi-grid">
              <StatCard
                label="Total Mention"
                value={nf.format(data.totals.mentions)}
                delta={6.4}
                hint={`${data.days} hari terakhir`}
                icon="💬"
                tone="blue"
              />
              <StatCard
                label="Skor Presepsi"
                value={`${data.totals.netSentiment > 0 ? '+' : ''}${data.totals.netSentiment}`}
                delta={3.1}
                hint="Indeks netral (skala -100..100)"
                icon="📈"
                tone="green"
              />
              <StatCard
                label="Engagement Rate"
                value={`${data.totals.engagementRate}%`}
                delta={-1.8}
                hint={`${nf.format(data.totals.engagement)} interaksi`}
                icon="⚡"
                tone="amber"
              />
              <StatCard
                label="Tingkat Balasan"
                value={`${data.totals.responseRate}%`}
                delta={2.2}
                hint="Pengaduan yang ditindaklanjuti"
                icon="✅"
                tone="violet"
              />
            </section>

            <section className="grid-2">
              <div className="panel panel--wide">
                <PanelHeader
                  title="Tren Presepsi"
                  subtitle="Sebaran sentimen harian"
                  right={<SentimentTabs value={sentimentFilter} onChange={setSentimentFilter} />}
                />
                {sentimentFilter === 'all' && trendChart ? (
                  <ChartCanvas {...trendChart} height={300} />
                ) : (
                  <FilteredTrendChart data={data} sentiment={sentimentFilter} />
                )}
              </div>

              <div className="panel">
                <PanelHeader title="Komposisi Sentimen" subtitle="Kumulasi periode ini" />
                {donutChart ? <ChartCanvas {...donutChart} height={248} /> : null}
                <SentimentBar
                  positif={data.totals.positif}
                  netral={data.totals.netral}
                  negatif={data.totals.negatif}
                />
              </div>
            </section>

            <section className="panel">
              <PanelHeader
                title="Kanal Media Sosial"
                subtitle="Klik kanal untuk melihat rincian"
              />
              <div className="platform-grid">
                {data.byPlatform.map((stat) => {
                  const platform = PLATFORM_MAP[stat.platformId]
                  return (
                    <PlatformCard
                      key={stat.platformId}
                      stat={stat}
                      platform={platform}
                      active={platformId === stat.platformId}
                      spark={
                        sparkCharts[stat.platformId] ? (
                          <ChartCanvas {...sparkCharts[stat.platformId]} height={56} />
                        ) : null
                      }
                      onSelect={() =>
                        setPlatformId((current) =>
                          current === stat.platformId ? null : stat.platformId
                        )
                      }
                    />
                  )
                })}
              </div>
            </section>

            <section className="grid-2">
              <div className="panel">
                <PanelHeader title="Volume per Kanal" subtitle="Mention berdasarkan sentimen" />
                {platformBarChart ? <ChartCanvas {...platformBarChart} height={300} /> : null}
              </div>

              <div className="panel">
                <PanelHeader title="Topik Teratas" subtitle="Pemicu utama presepsi" />
                <TopicList topics={data.topics} />
              </div>
            </section>

            <section className="panel">
              <PanelHeader
                title="Mention Terbaru"
                subtitle={`${mentions.length} data ditampilkan`}
                right={
                  <input
                    className="search"
                    placeholder="Cari penulis, lokasi, atau kata kunci…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                }
              />
              <MentionTable mentions={mentions} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

/* ---------------- Sub-komponen ---------------- */

function Sidebar({ platforms, activeId, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark">TP</span>
        <span className="brand__text">
          <strong>Tirta Pakuan</strong>
          <small>Social Listening</small>
        </span>
      </div>

      <nav className="nav">
        <p className="nav__title">Ringkasan</p>
        <button
          type="button"
          className={`nav__item${activeId === null ? ' is-active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span>📊</span> Semua Kanal
        </button>

        <p className="nav__title">Media Sosial</p>
        {platforms.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`nav__item${activeId === p.id ? ' is-active' : ''}`}
            onClick={() => onSelect(activeId === p.id ? null : p.id)}
            style={{ '--brand': p.color }}
          >
            <span className="nav__dot" />
            {p.name}
          </button>
        ))}
      </nav>

      <div className="sidebar__foot">
        <span className="pulse" />
        <span>Data dummy · sinkron aktif</span>
      </div>
    </aside>
  )
}

function Topbar({ platform, period, onPeriodChange, onRefresh, loading, lastSync }) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">Dashboard Presepsi</p>
        <h1>
          {platform ? platform.name : 'Semua Kanal Media Sosial'}
          {platform ? <small>{platform.handle}</small> : null}
        </h1>
      </div>

      <div className="topbar__actions">
        <div className="segmented" role="tablist" aria-label="Periode">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              className={period === p.id ? 'is-active' : ''}
              onClick={() => onPeriodChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--primary" onClick={onRefresh} disabled={loading}>
          {loading ? 'Mengambil…' : '⟳ Tarik Data'}
        </button>
        <span className="topbar__sync">{lastSync}</span>
      </div>
    </header>
  )
}

function PanelHeader({ title, subtitle, right }) {
  return (
    <header className="panel__head">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {right}
    </header>
  )
}

function SentimentTabs({ value, onChange }) {
  return (
    <div className="segmented segmented--sm">
      <button
        type="button"
        className={value === 'all' ? 'is-active' : ''}
        onClick={() => onChange('all')}
      >
        Semua
      </button>
      {Object.values(SENTIMENTS).map((s) => (
        <button
          key={s.id}
          type="button"
          className={value === s.id ? 'is-active' : ''}
          onClick={() => onChange(s.id)}
          style={{ '--tone': s.color }}
        >
          {s.icon} {s.label}
        </button>
      ))}
    </div>
  )
}

function FilteredTrendChart({ data, sentiment }) {
  const config = useMemo(
    () => ({
      type: 'line',
      data: {
        labels: data.timeline.map((d) => d.label),
        datasets: [
          {
            label: SENTIMENTS[sentiment].label,
            data: data.timeline.map((d) => d[sentiment]),
            borderColor: SENTIMENTS[sentiment].color,
            backgroundColor: `${SENTIMENTS[sentiment].color}22`,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: lineOptions,
    }),
    [data, sentiment]
  )
  return <ChartCanvas {...config} height={300} />
}

function TopicList({ topics }) {
  const max = Math.max(1, ...topics.map((t) => t.mentions))
  return (
    <ul className="topic-list">
      {topics.map((t) => {
        const negShare = (t.negatif / Math.max(1, t.mentions)) * 100
        return (
          <li key={t.topic}>
            <div className="topic-list__head">
              <span>{t.topic}</span>
              <strong>{nf.format(t.mentions)}</strong>
            </div>
            <div className="topic-list__bar">
              <span style={{ width: `${(t.mentions / max) * 100}%` }} />
              <i style={{ width: `${negShare}%` }} />
            </div>
            <small>{negShare.toFixed(0)}% bernada negatif</small>
          </li>
        )
      })}
    </ul>
  )
}

function MentionTable({ mentions }) {
  if (mentions.length === 0) {
    return <p className="empty">Tidak ada mention yang cocok dengan filter.</p>
  }
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Penulis</th>
            <th>Kanal</th>
            <th>Konten</th>
            <th>Sentimen</th>
            <th className="ta-right">Engagement</th>
            <th className="ta-right">Balas</th>
          </tr>
        </thead>
        <tbody>
          {mentions.map((m) => {
            const meta = SENTIMENTS[m.sentiment]
            return (
              <tr key={m.id}>
                <td>
                  <div className="author">
                    <AuthorAvatar name={m.author} />
                    <span>
                      <strong>{m.author}</strong>
                      <small>
                        {m.location} · {m.label}
                      </small>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="chip" style={{ '--chip': PLATFORM_MAP[m.platformId].color }}>
                    {PLATFORM_MAP[m.platformId].name}
                  </span>
                  <small className="topic-tag">{m.topic}</small>
                </td>
                <td className="cell-text">{m.text}</td>
                <td>
                  <span className="chip chip--sentiment" style={{ '--chip': meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                </td>
                <td className="ta-right">
                  ♥ {m.likes} · 💬 {m.comments} · ↻ {m.shares}
                </td>
                <td className="ta-right">
                  {m.replied ? (
                    <span className="chip chip--ok">Sudah</span>
                  ) : (
                    <span className="chip chip--pending">Belum</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Mengambil data presepsi dari seluruh kanal…</p>
    </div>
  )
}

/* ---------------- Helper ---------------- */

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: '#94A3B8', usePointStyle: true, padding: 16 } },
    tooltip: { backgroundColor: '#0F172A', borderColor: '#1E293B', borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: '#94A3B8', maxTicksLimit: 10 }, grid: { display: false } },
    y: {
      ticks: { color: '#94A3B8', precision: 0 },
      grid: { color: 'rgba(148,163,184,.12)' },
    },
  },
}

const sparkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
  elements: { line: { borderJoinStyle: 'round' } },
}

function lastSyncLabel(status, data) {
  if (status === 'loading') return 'Mengambil data…'
  if (!data) return ''
  return `Terakhir diperbarui: ${new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`
}