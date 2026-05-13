import { useEffect, useRef, useState } from 'react'

const API_BASE = 'https://envechat.onrender.com'

let cachedRooms = []
let alreadyFetched = false

export default function useChatRooms(token) {
  const [rooms, setRooms] = useState(cachedRooms)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!token) return

    // STOP duplicate fetching
    if (alreadyFetched || fetchingRef.current) {
      return
    }

    fetchingRef.current = true
    alreadyFetched = true

    const fetchRooms = async () => {
      try {
        setLoading(true)

        const res = await fetch(`${API_BASE}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch rooms')
        }

        const data = await res.json()

        cachedRooms = data
        setRooms(data)
        setError(null)

      } catch (err) {
        console.error('Rooms fetch failed:', err)
        setError(err.message)

        // allow retry later
        alreadyFetched = false

      } finally {
        fetchingRef.current = false
        setLoading(false)
      }
    }

    fetchRooms()
  }, [token])

  return {
    rooms,
    setRooms,
    loading,
    error,
  }
}