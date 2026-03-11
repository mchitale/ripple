import { useState, useEffect } from 'react'
import { Button, Card, Spinner } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { submitCheckin, getUserTodayCheckin } from '../lib/db.js'
import { getTodaysWildcard } from '../lib/wildcards.js'
import { todayString, getCurrentPeriod, getGreeting } from '../lib/utils.js'
import styles from './Checkin.module.css'

const MOOD_EMOJIS = ['😩','😕','😐','🙂','😄','🤩']
const GYM_OPTIONS = ['Rest day', 'Light movement', 'Full session']

export default function Checkin({ onComplete }) {
  const { session } = useAuth()
  const [period, setPeriod]   = useState(getCurrentPeriod())
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const wildcard = getTodaysWildcard()

  const [values, setValues] = useState({
    mood: 4,
    energy: 6,
    sleepQuality: 7,
    socialBattery: 5,
    gym: '',
    shower: '',
    water: 4,
    wildcardText: '',
  })

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }))

  const greeting = getGreeting(session.userName, period)

  useEffect(() => {
    async function check() {
      setLoading(true)
      const existing = await getUserTodayCheckin(session.userId, session.groupId, todayString(), period)
      if (existing) setAlreadyDone(true)
      setLoading(false)
    }
    check()
  }, [period, session])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await submitCheckin({
        userId:  session.userId,
        groupId: session.groupId,
        period,
        date: todayString(),
        values,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  if (submitted || alreadyDone) {
    return (
      <div className={styles.submitted + ' animate-fade-up'}>
        <div className={styles.checkCircle}>{submitted ? '✓' : '☀️'}</div>
        <h2 className='font-serif'>
          {submitted ? 'Logged.' : `Already logged your ${period}!`}
        </h2>
        <p>
          {submitted
            ? `Your ${period} is in the books. ${period === 'morning' ? 'Check back tonight.' : 'See you tomorrow.'}`
            : `You already checked in this ${period}. Come back ${period === 'morning' ? 'this evening' : 'tomorrow morning'}.`
          }
        </p>
        <Button onClick={onComplete} style={{ marginTop: '1.5rem' }}>
          See the group feed →
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h2 className='font-serif'>{greeting.text}</h2>
        <p>{greeting.sub}</p>
      </div>

      {/* Period toggle */}
      <div className={styles.periodToggle}>
        <button
          className={`${styles.periodBtn} ${period === 'morning' ? styles.active : ''}`}
          onClick={() => setPeriod('morning')}
        >☀️ Morning</button>
        <button
          className={`${styles.periodBtn} ${period === 'evening' ? styles.active : ''}`}
          onClick={() => setPeriod('evening')}
        >🌙 Evening</button>
      </div>

      {/* Mood */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>😌 Mood</div>
        <div className={styles.emojiRow}>
          {MOOD_EMOJIS.map((emoji, i) => (
            <button
              key={emoji}
              className={`${styles.emojiBtn} ${values.mood === i + 1 ? styles.selected : ''}`}
              onClick={() => set('mood', i + 1)}
            >{emoji}</button>
          ))}
        </div>
      </Card>

      {/* Energy */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>⚡ Energy</div>
        <SliderField value={values.energy} onChange={v => set('energy', v)} min={1} max={10} low="drained" high="wired" />
      </Card>

      {/* Sleep */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>💤 Sleep quality</div>
        <SliderField value={values.sleepQuality} onChange={v => set('sleepQuality', v)} min={1} max={10} low="terrible" high="perfect" />
      </Card>

      {/* Social battery */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🔋 Social battery</div>
        <SliderField value={values.socialBattery} onChange={v => set('socialBattery', v)} min={1} max={10} low="need solitude" high="let's go out" />
      </Card>

      {/* Gym */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🏋️ Gym / movement</div>
        <div className={styles.toggleRow}>
          {GYM_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`${styles.toggleBtn} ${values.gym === opt ? styles.toggleSelected : ''}`}
              onClick={() => set('gym', opt)}
            >{opt}</button>
          ))}
        </div>
      </Card>

      {/* Shower */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🚿 Shower</div>
        <div className={styles.toggleRow}>
          {['Yes ✓', 'Not yet'].map(opt => (
            <button
              key={opt}
              className={`${styles.toggleBtn} ${values.shower === opt ? styles.toggleSelected : ''}`}
              onClick={() => set('shower', opt)}
            >{opt}</button>
          ))}
        </div>
      </Card>

      {/* Water */}
      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>💧 Water intake</div>
        <SliderField value={values.water} onChange={v => set('water', v)} min={0} max={10} step={0.5} low="0 glasses" high="10+ glasses" />
      </Card>

      {/* Wildcard */}
      <Card highlighted style={{ marginBottom: '1.25rem' }}>
        <div className={styles.wildcardBadge}>✦ Today's wildcard</div>
        <div className={styles.cardLabel}>{wildcard}</div>
        <textarea
          className={styles.noteInput}
          rows={3}
          placeholder="A thought, a moment, a tiny thing..."
          value={values.wildcardText}
          onChange={e => set('wildcardText', e.target.value)}
        />
      </Card>

      <Button onClick={handleSubmit} disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Logging...' : `Log my ${period} ${period === 'morning' ? '☀️' : '🌙'}`}
      </Button>

      <div style={{ height: '2rem' }} />
    </div>
  )
}

function SliderField({ value, onChange, min, max, step = 1, low, high }) {
  return (
    <>
      <div className={styles.sliderRow}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderValue}>{value}</span>
      </div>
      <div className={styles.sliderLabels}>
        <span>{low}</span><span>{high}</span>
      </div>
    </>
  )
}
