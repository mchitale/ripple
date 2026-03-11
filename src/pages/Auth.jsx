import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, BackLink, ErrorMessage, Spinner } from '../components/UI.jsx'
import { createGroup, joinGroup } from '../lib/db.js'
import { useAuth } from '../lib/auth.jsx'
import styles from './Auth.module.css'

function AuthCard({ children }) {
  return (
    <div className={styles.page}>
      <Card style={{ maxWidth: 420, width: '100%' }}>
        {children}
      </Card>
    </div>
  )
}

// ── JOIN ─────────────────────────────────────────────────

export function JoinPage() {
  const navigate = useNavigate()
  const { login }  = useAuth()
  const [name, setName]       = useState('')
  const [code, setCode]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!name.trim() || !code.trim() || !password.trim()) {
      setError('Fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { group, user } = await joinGroup({ inviteCode: code, memberName: name.trim(), password })
      login({
        userId:      user.id,
        userName:    user.display_name,
        avatarColour: user.avatar_colour,
        groupId:     group.id,
        groupName:   group.name,
        inviteCode:  group.invite_code,
      })
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <BackLink onClick={() => navigate('/')} />
      <h2 className={styles.title + ' font-serif'}>Join a group</h2>
      <p className={styles.sub}>Your friend should have sent you a 4-letter code and the group password.</p>
      <div className={styles.form}>
        <Input label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maya" />
        <Input
          label="Invite code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD"
          maxLength={4}
          style={{ textAlign: 'center', fontSize: '1.6rem', fontFamily: 'Playfair Display, serif', letterSpacing: '0.25em' }}
        />
        <Input label="Group password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ask your group admin" />
        <ErrorMessage message={error} />
        <Button onClick={handleJoin} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Joining...' : 'Join →'}
        </Button>
      </div>
    </AuthCard>
  )
}

// ── CREATE ────────────────────────────────────────────────

export function CreatePage() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const [name, setName]           = useState('')
  const [groupName, setGroupName] = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [created, setCreated]     = useState(null)

  async function handleCreate() {
    if (!name.trim() || !groupName.trim() || !password) { setError('Fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords don\'t match.'); return }
    if (password.length < 4)  { setError('Password must be at least 4 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const { group, user } = await createGroup({ groupName: groupName.trim(), creatorName: name.trim(), password })
      setCreated(group)
      login({
        userId:      user.id,
        userName:    user.display_name,
        avatarColour: user.avatar_colour,
        groupId:     group.id,
        groupName:   group.name,
        inviteCode:  group.invite_code,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <AuthCard>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={'font-serif ' + styles.title}>Group created!</h2>
          <p className={styles.sub}>Share these details with your friends so they can join.</p>
          <div className={styles.codeBox}>
            <div className={styles.codeLabel}>Invite code</div>
            <div className={styles.codeValue}>{created.invite_code}</div>
          </div>
          <div className={styles.passwordHint}>
            <div className={styles.codeLabel}>Group password</div>
            <div className={styles.codeValue} style={{ fontSize: '1rem', letterSpacing: 'normal', fontFamily: 'DM Sans' }}>
              {password}
            </div>
          </div>
          <p className={styles.shareNote}>
            🔗 Share the URL of this app + the code + password with your group.
            They'll be in within seconds.
          </p>
          <Button onClick={() => navigate('/app')} style={{ width: '100%', marginTop: '1rem' }}>
            Enter the app →
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <BackLink onClick={() => navigate('/')} />
      <h2 className={styles.title + ' font-serif'}>Start a group</h2>
      <p className={styles.sub}>You'll get an invite code to share with your friends.</p>
      <div className={styles.form}>
        <Input label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" />
        <Input label="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. The Usual Suspects" />
        <Input label="Group password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Something memorable" />
        <Input label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Same again" />
        <ErrorMessage message={error} />
        <Button onClick={handleCreate} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating...' : 'Create group →'}
        </Button>
      </div>
    </AuthCard>
  )
}
