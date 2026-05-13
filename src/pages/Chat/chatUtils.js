const GRADS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#e879f9,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
]

export function displayName(name) {
  if (!name) return '??'
  return name.includes('@') ? name.split('@')[0] : name
}

export function initials(name) {
  return displayName(name).slice(0, 2).toUpperCase()
}

export function getGrad(name) {
  let h = 0
  for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % GRADS.length
  return GRADS[h]
}

export function fmtTime(ts) {
  return ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function dateDividerLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const today = startOfDay(Date.now())
  const y = startOfDay(Date.now() - 86400000)
  const day = startOfDay(d)
  if (day === today) return 'Today'
  if (day === y) return 'Yesterday'
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  })
}

export function messageKey(msg, index) {
  if (msg?.id != null) return String(msg.id)
  return `${msg?.sentAt ?? 'na'}-${msg?.senderUsername ?? 'u'}-${index}`
}
