import { useState, useEffect } from 'react'
import { Avatar, Card, Spinner } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getRecentCheckins, getGroupMembers } from '../lib/db.js'
import { computeInsights, computeStreaks } from '../lib/insights.js'
import styles from './Insights.module.css'

export default function Insights() {
  const { session }   = useAuth()
  const [insights, setInsights]     = useState(null)
  const [members, setMembers]       = useState([])
  const [checkins, setCheckins]     = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [data, memberList] = await Promise.all([
          getRecentCheckins(session.groupId, 14),
          getGroupMembers(session.groupId),
        ])
        setCheckins(data)
        const membersWithStreaks = computeStreaks(data, memberList)
        setMembers(membersWithStreaks)
        setInsights(computeInsights(data))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session.groupId])

  if (loading) return <Spinner />

  const checkInRate = checkins.length > 0
    ? Math.round((checkins.length / (members.length * 14 * 2)) * 100)
    : 0

  const avgMood = checkins.length > 0
    ? (checkins.reduce((a, c) => a + (c.mood || 0), 0) / checkins.filter(c => c.mood).length).toFixed(1)
    : '—'

  const maxStreak = members.length > 0 ? Math.max(...members.map(m => m.streak)) : 0

  return (
    <div className={styles.page}>
      <h2 className={'font-serif ' + styles.heading}>Group pulse</h2>
      <p className={styles.sub}>Last 14 days · {members.length} members</p>

      {/* Member pills */}
      <div className={styles.memberPills}>
        {members.map(m => (
          <div key={m.id} className={styles.pill}>
            <Avatar name={m.display_name} colour={m.avatar_colour} size={26} />
            <span className={styles.pillName}>{m.display_name}</span>
            {m.streak > 1 && <span className={styles.streak}>{m.streak}🔥</span>}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <StatBox value={`${checkInRate}%`} label="Check-in rate" />
        <StatBox value={avgMood} label="Avg mood" />
        <StatBox value={`${maxStreak}`} label="Best streak 🔥" />
      </div>

      {/* Insights */}
      {!insights || insights.length === 0 ? (
        <Card>
          <div className={styles.noData}>
            <p>✨ Keep logging for a few more days and patterns will start appearing here.</p>
          </div>
        </Card>
      ) : (
        insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))
      )}
    </div>
  )
}

function StatBox({ value, label }) {
  return (
    <div className={styles.statBox}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function InsightCard({ insight }) {
  const maxBar = Math.max(...insight.bars.map(b => b.value), 1)

  return (
    <Card highlighted={insight.isWildcard} style={{ marginBottom: '1rem' }}>
      {insight.isWildcard && <div className={styles.wildcardBadge}>✦ Wildcard insight</div>}
      <h3 className={styles.insightTitle + ' font-serif'}>
        {insight.emoji} {insight.title}
      </h3>
      <p className={styles.insightDesc}>{insight.description}</p>
      <div className={styles.barChart}>
        {insight.bars.map((bar, i) => (
          <div key={i} className={styles.barWrap}>
            <div
              className={styles.bar}
              style={{
                height: `${Math.max((bar.value / maxBar) * 100, 5)}%`,
                background: insight.isWildcard ? 'var(--terracotta)' : i % 2 === 0 ? 'var(--terracotta-light)' : 'var(--terracotta)',
              }}
            />
            <span className={styles.barLabel}>{bar.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
