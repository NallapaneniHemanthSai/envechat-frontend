import { API_BASE } from '../config/api'
import { useCallback, useEffect, useState } from 'react'

export function useChatRooms(token, { onError } = {}) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!token) {
      setRooms([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load channels')
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (e) {
      const msg = e?.message || 'Channels request failed'
      setError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }, [token, onError])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createRoom = useCallback(
    async (rawName) => {
      const name = rawName.trim().toLowerCase().replace(/\s+/g, '-')
      if (!name || !token) return { ok: false, error: 'Invalid name' }
      try {
        const res = await fetch(`${API_BASE}/api/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Create channel failed')
        const room = await res.json()
        setRooms((prev) => [...prev, room])
        return { ok: true, room }
      } catch (e) {
        const msg = e?.message || 'Could not create channel'
        onError?.(msg)
        return { ok: false, error: msg }
      }
    },
    [token, onError],
  )

  return { rooms, setRooms, loading, error, refetch, createRoom }
}
