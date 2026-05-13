import { useEffect, useState } from 'react'

const API_BASE = 'https://envechat.onrender.com'

export default function useChatRooms(token) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return

    let isMounted = true
    let retryTimeout = null

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

        if (!isMounted) return

        setRooms(prev => {
          const prevIds = prev.map(r => r.id).join(',')
          const newIds = data.map(r => r.id).join(',')

          if (prevIds === newIds) {
            return prev
          }

          return data
        })

        setError(null)

      } catch (err) {
        console.error('Rooms fetch failed:', err)

        if (isMounted) {
          setError(err.message)

          retryTimeout = setTimeout(() => {
            fetchRooms()
          }, 5000)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRooms()

    return () => {
      isMounted = false

      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [token])

  return {
    rooms,
    setRooms,
    loading,
    error,
  }
}