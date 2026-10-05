import { SENTIMENTS } from '../data/platforms.js'

/** Kartu KPI ringkas untuk bagian atas dashboard. */
export function StatCard({ label, value, delta, hint, icon, tone = 'blue' }) {
  const up = delta >= 0
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <header className="stat-card__head">
        <span className="stat-card__label">{label}</span>
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
      </header>
      <div className="stat-card__value">{value}</div>
      <footer className="stat-card__foot">
        {Number.isFinite(delta) ? (
          <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
            {up ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        ) : null}
        <span className="stat-card__hint">{hint}</span>
      </footer>
    </article>
  )
}

/** Distribusi sentimen sebagai horizontal stacked bar. */
export function SentimentBar({ positif, netral, negatif }) {
  const total = Math.max(1, positif + netral + negatif)
  const parts = [
    { key: 'positif', value: positif, meta: SENTIMENTS.positif },
    { key: 'netral', value: netral, meta: SENTIMENTS.netral },
    { key: 'negatif', value: negatif, meta: SENTIMENTS.negatif },
  ]

  return (
    <div className="sentiment-bar-wrap">
      <div className="sentiment-bar">
        {parts.map((part) => (
          <span
            key={part.key}
            className="sentiment-bar__seg"
            style={{
              width: `${(part.value / total) * 100}%`,
              background: part.meta.color,
            }}
            title={`${part.meta.label}: ${part.value}`}
          />
        ))}
      </div>
      <ul className="sentiment-legend">
        {parts.map((part) => (
          <li key={part.key}>
            <span className="dot" style={{ background: part.meta.color }} />
            <span className="sentiment-legend__label">{part.meta.label}</span>
            <strong>{((part.value / total) * 100).toFixed(1)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Kartu kanal media sosial dengan sparkline tren mini. */
export function PlatformCard({ stat, platform, spark, onSelect, active }) {
  const total = Math.max(1, stat.positif + stat.netral + stat.negatif)
  const negShare = (stat.negatif / total) * 100
  const up = stat.trendPct >= 0

  return (
    <button
      type="button"
      className={`platform-card${active ? ' is-active' : ''}`}
      onClick={onSelect}
      style={{ '--brand': platform.color, '--brand-grad': platform.gradient }}
    >
      <header className="platform-card__head">
        <span className="platform-card__avatar" aria-hidden="true">
          {platform.name.charAt(0)}
        </span>
        <span className="platform-card__id">
          <strong>{platform.name}</strong>
          <small>{platform.handle}</small>
        </span>
        <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
          {up ? '▲' : '▼'} {Math.abs(stat.trendPct)}%
        </span>
      </header>

      <div className="platform-card__value">
        {stat.mentions.toLocaleString('id-ID')}
        <small> mentions</small>
      </div>

      {spark}

      <div className="platform-card__meta">
        <span>Negatif {negShare.toFixed(0)}%</span>
        <span>Balas {stat.responseRate}%</span>
      </div>
    </button>
  )
}

/** Avatar inisial untuk tabel mention. */
export function AuthorAvatar({ name }) {
  return <span className="avatar">{name.charAt(0)}</span>
}