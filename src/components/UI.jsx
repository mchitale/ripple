import styles from './UI.module.css'

export function Avatar({ name, colour, size = 36 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, background: colour, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

export function Button({ children, variant = 'primary', onClick, disabled, style, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn-${variant}`]}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}

export function Input({ label, ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={styles.input} {...props} />
    </div>
  )
}

export function Card({ children, style, highlighted }) {
  return (
    <div className={`${styles.card} ${highlighted ? styles.cardHighlighted : ''}`} style={style}>
      {children}
    </div>
  )
}

export function Spinner() {
  return <div className={styles.spinner} />
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return <div className={styles.error}>{message}</div>
}

export function BackLink({ onClick }) {
  return (
    <button className={styles.backLink} onClick={onClick}>
      ← back
    </button>
  )
}
