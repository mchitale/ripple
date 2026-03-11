import { useState, useEffect } from 'react'
import { Avatar, Card, Spinner } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getTodaysCheckins, subscribeToCheckins } from '../lib/db.js'
import { formatDate, formatTime, todayString, moodToEmoji } from '../lib/utils.js'
import styles from './Feed.module.css'

export default function Feed() {
  const { session } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    load()
    // Real-time subscription
    const channel = subscribeToCheckins(session.groupId, () => load())
    return () => channel.unsubscribe()
  }, [session.groupId])

  async function load() {
    try {
      const data = await getTodaysCheckins(session.groupId, todayString())
      setCheckins(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className={styles.page}>
      <div className={styles.dateLabel}>{formatDate()}</div>

      {checkins.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌿</div>
          <p>No check-ins yet today.<br />Be the first to log.</p>
        </div>
      )}

      {checkins.map(checkin => (
        <FeedEntry key={checkin.id} checkin={checkin} isMe={checkin.member_id === session.userId} />
      ))}

      {checkins.length > 0 && (
        <div className={styles.endNote}>You're all caught up 🌿</div>
      )}
    </div>
  )
}

function FeedEntry({ checkin, isMe }) {
  const { members: member } = checkin

  return (
    <Card style={{ marginBottom: '0.9rem', opacity: 1, animation: 'fadeUp 0.4s ease both' }}>
      <div className={styles.entryHeader}>
        <div className={styles.person}>
          <Avatar name={member?.display_name} colour={member?.avatar_colour} size={38} />
          <div>
            <div className={styles.name}>
              {member?.display_name} {isMe && <span className={styles.youBadge}>you</span>}
            </div>
            <div className={styles.time}>
              {checkin.period === 'morning' ? '☀️ Morning' : '🌙 Evening'} · {formatTime(checkin.created_at)}
            </div>
          </div>
        </div>
        <span className={styles.moodEmoji}>{moodToEmoji(checkin.mood)}</span>
      </div>

      <div className={styles.chips}>
        <Chip label="⚡" value={checkin.energy} suffix="/10" />
        <Chip label="💤" value={checkin.sleep_quality} suffix="/10" />
        <Chip label="🔋" value={checkin.social_battery} suffix="/10" />
        {checkin.gym && <Chip label="🏋️" value={checkin.gym} gym={checkin.gym === 'Full session'} />}
        {checkin.shower && <Chip label="🚿" value={checkin.shower} />}
        <Chip label="💧" value={checkin.water} suffix=" gl" />
      </div>

      {checkin.wildcard_text && (
        <div className={styles.note}>"{checkin.wildcard_text}"</div>
      )}
    </Card>
  )
}

function Chip({ label, value, suffix = '', gym }) {
  return (
    <span className={`${styles.chip} ${gym ? styles.chipGym : ''}`}>
      {label} <span className={styles.chipVal}>{value}{suffix}</span>
    </span>
  )
}
