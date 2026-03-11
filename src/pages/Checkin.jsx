import { useState, useEffect } from 'react'
import { Button, Card, Spinner } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { submitCheckin, getUserTodayCheckin } from '../lib/db.js'
import { getTodaysWildcard } from '../lib/wildcards.js'
import { todayString, getCurrentPeriod, getGreeting } from '../lib/utils.js'
import styles from './Checkin.module.css'

const MOOD_EMOJIS = ['😩','😕','😐','🙂','😄','🤩']
const GYM_OPTIONS = ['Rest day', 'Light movement', 'Full session']

export default function Checkin({ onComplete, editEntry, onClearEdit }) {
  const { session } = useAuth()
  const isEditing = !!editEntry

  const [period, setPeriod]         = useState(editEntry?.period || getCurrentPeriod())
  const [loading, setLoading]       = useState(!isEditing)
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const wildcard = getTodaysWildcard()

  const [values, setValues] = useState(
    editEntry ? {
      mood:          editEntry.mood           || 4,
      energy:        editEntry.energy         || 6,
      sleepQuality:  editEntry.sleep_quality  || 7,
      socialBattery: editEntry.social_battery || 5,
      gym:           editEntry.gym            || '',
      shower:        editEntry.shower         || '',
      water:         editEntry.water          || 4,
      wildcardText:  editEntry.wildcard_text  || '',
    } : {
      mood: 4, energy: 6, sleepQuality: 7,
      socialBattery: 5, gym: '', shower: '',
      water: 4, wildcardText: '',
    }
  )

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }))
  const greeting = getGreeting(session.userName, period)

  useEffect(() => {
    if (isEditing) return
    async function check() {
      setLoading(true)
      const existing = await getUserTodayCheckin(session.userId, session.groupId, todayString(), period)
      if (existing) {
        setValues({
          mood:          existing.mood           || 4,
          energy:        existing.energy         || 6,
          sleepQuality:  existing.sleep_quality  || 7,
          socialBattery: existing.social_battery || 5,
          gym:           existing.gym            || '',
          shower:        existing.shower         || '',
          water:         existing.water          || 4,
          wildcardText:  existing.wildcard_text  || '',
        })
      }
      setLoading(false)
    }
    check()
  }, [period, session, isEditing])

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
      if (onClearEdit) onClearEdit()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  if (submitted) {
    return (
      <div className={styles.submitted + ' animate-fade-up'}>
        <div className={styles.checkCircle}>✓</div>
        <h2 className='font-serif'>{isEditing ? 'Updated.' : 'Logged.'}</h2>
        <p>
          {isEditing
            ? 'Your entry has been updated.'
            : `Your ${period} is in the books. ${period === 'morning' ? 'Check back tonight.' : 'See you tomorrow.'}`
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
      {isEditing && (
        <div className={styles.editBanner}>
          ✏️ Editing your {editEntry.period} check-in
          <button className={styles.editCancel} onClick={() => { onClearEdit(); onComplete() }}>Cancel</button>
        </div>
      )}

      <div className={styles.greeting}>
        <h2 className='font-serif'>{greeting.text}</h2>
        <p>{greeting.sub}</p>
      </div>

      <div className={styles.periodToggle}>
        <button className={`${styles.periodBtn} ${period === 'morning' ? styles.active : ''}`} onClick={() => setPeriod('morning')}>☀️ Morning</button>
        <button className={`${styles.periodBtn} ${period === 'evening' ? styles.active : ''}`} onClick={() => setPeriod('evening')}>🌙 Evening</button>
      </div>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>😌 Mood</div>
        <div className={styles.emojiRow}>
          {MOOD_EMOJIS.map((emoji, i) => (
            <button key={emoji} className={`${styles.emojiBtn} ${values.mood === i + 1 ? styles.selected : ''}`} onClick={() => set('mood', i + 1)}>{emoji}</button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>⚡ Energy</div>
        <SliderField value={values.energy} onChange={v => set('energy', v)} min={1} max={10} low="drained" high="wired" />
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>💤 Sleep quality</div>
        <SliderField value={values.sleepQuality} onChange={v => set('sleepQuality', v)} min={1} max={10} low="terrible" high="perfect" />
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🔋 Social battery</div>
        <SliderField value={values.socialBattery} onChange={v => set('socialBattery', v)} min={1} max={10} low="need solitude" high="let's go out" />
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🏋️ Gym / movement</div>
        <div className={styles.toggleRow}>
          {GYM_OPTIONS.map(opt => (
            <button key={opt} className={`${styles.toggleBtn} ${values.gym === opt ? styles.toggleSelected : ''}`} onClick={() => set('gym', opt)}>{opt}</button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>🚿 Shower</div>
        <div className={styles.toggleRow}>
          {['Yes ✓', 'Not yet'].map(opt => (
            <button key={opt} className={`${styles.toggleBtn} ${values.shower === opt ? styles.toggleSelected : ''}`} onClick={() => set('shower', opt)}>{opt}</button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '0.9rem' }}>
        <div className={styles.cardLabel}>💧 Water intake</div>
        <SliderField value={values.water} onChange={v => set('water', v)} min={0} max={10} step={0.5} low="0 glasses" high="10+ glasses" />
      </Card>

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
        {submitting ? 'Saving...' : isEditing ? 'Save changes ✓' : `Log my ${period} ${period === 'morning' ? '☀️' : '🌙'}`}
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
