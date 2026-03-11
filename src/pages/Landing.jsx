import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getAvatarColour, getInitials } from '../lib/utils.js'
import styles from './Landing.module.css'

export default function Landing() {
  const navigate = useNavigate()
  const { session, allSessions, switchGroup, loading } = useAuth()

  // If only one group saved and it's active, skip straight to app
  useEffect(() => {
    if (!loading && session && allSessions.length === 1) {
      navigate('/app', { replace: true })
    }
  }, [session, allSessions, loading])

  function handleSwitch(groupId) {
    switchGroup(groupId)
    navigate('/app', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.inner + ' animate-fade-up'}>
        <div className={styles.logoMark}>🌊</div>
        <h1 className={styles.wordmark + ' font-serif'}>ripple</h1>
        <p className={styles.tagline}>
          A tiny daily check-in,<br />shared with the people who actually get you.
        </p>

        {/* Saved groups */}
        {allSessions.length > 0 && (
          <div className={styles.savedGroups}>
            <div className={styles.savedLabel}>Your groups</div>
            {allSessions.map(s => (
              <button
                key={s.groupId}
                className={`${styles.groupRow} ${session?.groupId === s.groupId ? styles.groupRowActive : ''}`}
                onClick={() => handleSwitch(s.groupId)}
              >
                <div
                  className={styles.groupAvatar}
                  style={{ background: getAvatarColour(s.groupName) }}
                >
                  {getInitials(s.groupName)}
                </div>
                <div className={styles.groupInfo}>
                  <span className={styles.groupName}>{s.groupName}</span>
                  <span className={styles.groupMeta}>{s.userName} · {s.inviteCode}</span>
                </div>
                {session?.groupId === s.groupId && <span className={styles.activeDot} />}
                <span className={styles.groupArrow}>→</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button onClick={() => navigate('/join')}>Join another group</Button>
          <Button variant="secondary" onClick={() => navigate('/create')}>Create a group</Button>
        </div>
      </div>
    </div>
  )
}
