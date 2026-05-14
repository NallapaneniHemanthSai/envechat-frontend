import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoom as createRoomRequest, getRooms } from '../services/api'

const roomCache = new Map()

const useChatRooms = (token) => {
  const [rooms, setRooms] = useState(() => roomCache.get(token) || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!token) {
      setRooms([])
      setError(null)
      return
    }

    if (roomCache.has(token)) {
      setRooms(roomCache.get(token))
      return
    }

    if (fetchingRef.current) {
      return
    }

    let ignore = false
    fetchingRef.current = true

    const fetchRooms = async () => {
      try {
        setLoading(true)

        const { data } = await getRooms()

        if (ignore) return
        roomCache.set(token, data)
        setRooms(data)
        setError(null)
      } catch (err) {
        if (ignore) return
        console.error('Rooms fetch failed:', err)
        setError(err?.response?.data?.message || err.message)
      } finally {
        if (!ignore) {
          fetchingRef.current = false
          setLoading(false)
        }
      }
    }

    fetchRooms()

    return () => {
      ignore = true
      fetchingRef.current = false
    }
  }, [token])

  const createRoom = useCallback(async (name) => {
    const trimmed = name?.trim()
    if (!trimmed) {
      return { ok: false, error: 'Channel name is required' }
    }

    try {
      const { data: room } = await createRoomRequest({ name: trimmed })

      setRooms((prev) => {
        if (prev.some((r) => String(r.id) === String(room.id))) return prev
        const next = [...prev, room]
        if (token) roomCache.set(token, next)
        return next
      })

      return {
        ok: true,
        room,
      }

    } catch (err) {
      return {
        ok: false,
        error: err?.response?.data?.message || err.message,
      }
    }
  }, [token])

  return {
    rooms,
    setRooms,
    loading,
    error,
    createRoom,
  }
}

export default useChatRooms
