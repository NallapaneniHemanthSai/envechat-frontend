import axios from 'axios'
import { API_BASE } from '../config/api'

const API = axios.create({
  baseURL: API_BASE,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  // 🔥 safer check
  const isAuthRoute =
    config.url.includes('/api/auth/login') ||
    config.url.includes('/api/auth/signup')

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

API.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.message || err?.message || 'Request failed'
    console.warn('[api]', msg)
    return Promise.reject(err)
  },
)

export const signup = (data) => API.post('/api/auth/signup', data)
export const login = (data) => API.post('/api/auth/login', data)
export const getRoomHistory = (roomId) => API.get(`/api/chat/${roomId}/history`)