import { useState, useEffect } from 'react'
import { Avatar, Card, Spinner } from '../components/UI.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getGroupMembers, kickMember, getGroupAdmin } from '../lib/db.js'
import styles from './Members.module.css'

export default function Members() {
  const { session }   = useAuth()
  const [members,  setMembers]  = useState([])
  const [adminId,  setAdminId]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [kicking,  setKicking]  = useState(null) // memberId currently being kicked
  const [confirm,  setConfirm]  = useState(null) // memberId pending confirmation

  const isAdmin = adminId === session.userId

  useEffect(() => {
    load()
  }, [session.groupId])

  async function load() {
    setLoading(true)
    try {
      const [memberList, admin] = await Promise.all([
        getGroupMembers(session.groupId),
        getGroupAdmin(session.groupId),
      ])
      setMembers(memberList)
      setAdminId(admin)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleKick(memberId) {
    setKicking(memberId)
    try {
      await kickMember(memberId)
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch (err) {
      console.error(err)
      alert('Something went wrong removing that member.')
    } finally {
      setKicking(null)
      setConfirm(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className={styles.page}>
      <h2 className={'font-serif ' + styles.heading}>Members</h2>
      <p className={styles.sub}>
        {members.length} {members.length === 1 ? 'person' : 'people'} in {session.groupName}
        {isAdmin && <span className={styles.adminTag}>You're the admin</span>}
      </p>

      <div className={styles.inviteBox}>
        <div className={styles.inviteLabel}>Invite code</div>
        <div className={styles.inviteRow}>
          <span className={styles.inviteCode}>{session.inviteCode}</span>
          <button
            className={styles.copyBtn}
            onClick={() => navigator.clipboard?.writeText(session.inviteCode)}
          >
            Copy
          </button>
        </div>
        <div className={styles.inviteHint}>Share this + the group password with anyone you want to add.</div>
      </div>

      <div className={styles.memberList}>
        {members.map(member => {
          const isMe      = member.id === session.userId
          const isAdminM  = member.id === adminId
          const isPending = confirm === member.id
          const isKicking = kicking === member.id

          return (
            <Card key={member.id} style={{ marginBottom: '0.6rem', padding: '1rem 1.1rem' }}>
              <div className={styles.memberRow}>
                <Avatar name={member.display_name} colour={member.avatar_colour} size={40} />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{member.display_name}</span>
                  <div className={styles.badges}>
                    {isMe     && <span className={styles.badge + ' ' + styles.badgeYou}>you</span>}
                    {isAdminM && <span className={styles.badge + ' ' + styles.badgeAdmin}>admin</span>}
                  </div>
                </div>

                {/* Admin can kick anyone except themselves */}
                {isAdmin && !isMe && (
                  isPending ? (
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmText}>Remove?</span>
                      <button
                        className={styles.confirmYes}
                        onClick={() => handleKick(member.id)}
                        disabled={isKicking}
                      >
                        {isKicking ? '...' : 'Yes'}
                      </button>
                      <button
                        className={styles.confirmNo}
                        onClick={() => setConfirm(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.kickBtn}
                      onClick={() => setConfirm(member.id)}
                    >
                      Remove
                    </button>
                  )
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
