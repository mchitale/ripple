// Simple password hash using Web Crypto API (SHA-256)
export async function hashPassword(password) {
  const msgBuffer  = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Generate a random 4-letter invite code
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I or O to avoid confusion
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Avatar colours — assigned deterministically from name
const AVATAR_COLOURS = [
  '#C4694A', '#6B7A47', '#8B6BAE', '#4A7C8B',
  '#B87333', '#7A4A8B', '#3D7A5C', '#8B4A4A',
]
export function getAvatarColour(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length]
}

// Get initials from display name
export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Format date as "Tuesday 10 Mar"
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
}

// Format time as "8:42 am"
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// Get today's date string YYYY-MM-DD
export function todayString() {
  return new Date().toISOString().split('T')[0]
}

// Determine period from hour
export function getCurrentPeriod() {
  return new Date().getHours() < 14 ? 'morning' : 'evening'
}

// Greeting text
export function getGreeting(name, period) {
  const greetings = {
    morning: { text: `Good morning, ${name} ☀️`, sub: 'How are you rolling into today?' },
    evening: { text: `Evening, ${name} 🌙`,       sub: 'How did the day land?' },
  }
  return greetings[period] || greetings.morning
}

// Emoji mood map (value 1–6 → emoji)
export const MOOD_EMOJIS = ['😩','😕','😐','🙂','😄','🤩']
export function moodToEmoji(val) { return MOOD_EMOJIS[Math.min(Math.max(val - 1, 0), 5)] }
