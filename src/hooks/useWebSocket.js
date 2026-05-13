import { useCallback, useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { API_BASE } from '../config/api'

export function useWebSocket(roomId, onMessage) {
  const stompClient = useRef(null)
  const subscriptionRef = useRef(null)

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!roomId) return

    let isMounted = true

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

      debug: () => {},

      reconnectDelay: 5000,

      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        if (!isMounted) return

        console.log('✅ WebSocket Connected')

        setConnected(true)

        // remove old subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
          subscriptionRef.current = null
        }

        // create fresh subscription
        subscriptionRef.current = client.subscribe(
          `/topic/room/${roomId}`,
          (message) => {
            try {
              const body = JSON.parse(message.body)

              if (onMessage) {
                onMessage(body)
              }
            } catch (err) {
              console.error('Message parse error:', err)
            }
          },
        )
      },

      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected')
        setConnected(false)
      },

      onStompError: (frame) => {
        console.error('STOMP ERROR:', frame)
        setConnected(false)
      },

      onWebSocketError: (err) => {
        console.error('WebSocket Error:', err)
        setConnected(false)
      },
    })

    client.activate()

    stompClient.current = client

    return () => {
      isMounted = false

      setConnected(false)

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }

      if (client.active) {
        client.deactivate()
      }

      stompClient.current = null
    }
  }, [roomId])

  const sendMessage = useCallback(
    (content) => {
      if (!content?.trim()) return

      if (!stompClient.current) {
        console.error('No STOMP client')
        return
      }

      if (!connected) {
        console.error('WebSocket not connected')
        return
      }

      try {
        stompClient.current.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify({
            content: content.trim(),
          }),
        })
      } catch (err) {
        console.error('Send message error:', err)
      }
    },
    [roomId, connected],
  )

  return {
    sendMessage,
    connected,
  }
}