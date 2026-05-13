/** Single source of truth for API / WebSocket origin */
export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'https://envechat.onrender.com'

export const WS_URL = `${API_BASE}/ws`
