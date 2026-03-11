import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { useNavigate } from 'react-router-dom'
import { getAvatarColour, getInitials } from '../lib/utils.js'
import Checkin from './Checkin.jsx'
import Feed from './Feed.jsx'
import Insights from './Insights.jsx'
import styles from './AppShell.module.css'

const TABS = [
  { id: 'checkin',  label: 'Check-in', icon: '✏️' },
  { id: 'feed',     label: 'Feed',     icon: '🌿' },
  { id: 'insights', label: 'Insights', icon: '📊' },
]

export default function AppShell() {
  const { session, allSessions, switchGroup, leaveGroup } = useAuth()
  const navigate   = useNavigate()
  const [activeTab, setActiveTab] = useState('checkin')
  const [showMenu,  setShowMenu]  = useState(false)

  function handleSwitch(groupId) {
    switchGroup(groupId)
    setShowMenu(false)
    setActiveTab('checkin')
  }

  function handleLeave() {
    leaveGroup()
    navigate('/', { replace: true })
  }

  const otherGroups = allSessions.filter(s => s.groupId !== session?.groupId)

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <span className={'font-serif ' + styles.wordmark}>ripple 🌊</span>
        <div className={styles.headerRight}>
          <span className={styles.groupBadge}>{session.groupName}</span>
          <button className={styles.menuBtn} onClick={() => setShowMenu(v => !v)}>⋮</button>
        </div>
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <div className={styles.dropdownOverlay} onClick={() => setShowMenu(false)}>
          <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
            <div className={styles.dropdownUser}>
              <span className={styles.dropdownName}>{session.userName}</span>
              <span className={styles.dropdownGroup}>{session.groupName} · {session.inviteCode}</span>
            </div>

            <button className={styles.dropdownItem} onClick={() => { setShowMenu(false); navigator.clipboard?.writeText(session.inviteCode) }}>
              📋 Copy invite code
            </button>

            {/* Switch group */}
            {otherGroups.length > 0 && (
              <>
                <div className={styles.dropdownDivider}>Switch group</div>
                {otherGroups.map(s => (
                  <button key={s.groupId} className={styles.dropdownItem} onClick={() => handleSwitch(s.groupId)}>
                    <span
                      className={styles.switchAvatar}
                      style={{ background: getAvatarColour(s.groupName) }}
                    >
                      {getInitials(s.groupName)}
                    </span>
                    {s.groupName}
                    <span className={styles.switchMeta}>{s.userName}</span>
                  </button>
                ))}
              </>
            )}

            <button className={styles.dropdownItem} onClick={() => { setShowMenu(false); navigate('/') }}>
              ＋ Join / create a group
            </button>

            <button className={styles.dropdownItem + ' ' + styles.dropdownLogout} onClick={handleLeave}>
              Leave this group
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className={styles.main}>
        {activeTab === 'checkin'  && <Checkin onComplete={() => setActiveTab('feed')} />}
        {activeTab === 'feed'     && <Feed />}
        {activeTab === 'insights' && <Insights />}
      </main>

      {/* Bottom nav */}
      <nav className={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.navTab} ${activeTab === tab.id ? styles.navActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            <span className={styles.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}