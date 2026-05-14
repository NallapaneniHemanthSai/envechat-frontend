import axios from 'axios'
import { API_BASE } from '../config/api'

const API = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  const isAuthRoute =
    config.url?.includes('/api/auth/login') ||
    config.url?.includes('/api/auth/signup')

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

    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('envechat:auth-expired'))
    }

    console.warn('[api]', msg)
    return Promise.reject(err)
  },
)

export const signup = (data) => API.post('/api/auth/signup', data)
export const login = (data) => API.post('/api/auth/login', data)
export const getRoomHistory = (roomId) => API.get(`/api/chat/${roomId}/history`)
export const getRooms = () => API.get('/api/rooms')
export const createRoom = (data) => API.post('/api/rooms', data)
export default API
