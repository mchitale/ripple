import { useNavigate } from 'react-router-dom'
import { Button } from '../components/UI.jsx'
import styles from './Landing.module.css'

export default function Landing() {
  const navigate = useNavigate()
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
        <div className={styles.actions}>
          <Button onClick={() => navigate('/join')}>Join a group</Button>
          <Button variant="secondary" onClick={() => navigate('/create')}>Create a group</Button>
        </div>
      </div>
    </div>
  )
}
