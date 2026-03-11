import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { useNavigate } from 'react-router-dom'
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
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('checkin')
  const [showMenu, setShowMenu]   = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

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
            <button className={styles.dropdownItem + ' ' + styles.dropdownLogout} onClick={handleLogout}>
              Leave group
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
