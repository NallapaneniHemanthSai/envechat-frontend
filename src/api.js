import axios from 'axios'

const API = axios.create({
  baseURL: "https://envechat.onrender.com",
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

export const signup = (data) => API.post('/api/auth/signup', data)
export const login = (data) => API.post('/api/auth/login', data)
export const getRoomHistory = (roomId) => API.get(`/api/chat/${roomId}/history`)