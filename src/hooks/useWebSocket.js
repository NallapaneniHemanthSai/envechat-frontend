import { useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { API_BASE } from '../config/api'

export function useWebSocket(roomId, onMessage) {
  const stompClient = useRef(null)

  useEffect(() => {
    if (!roomId) return

    const socket = new SockJS(`${API_BASE}/ws`)

    const client = new Client({
      webSocketFactory: () => socket,

      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

      debug: (str) => {
        console.log(str)
      },

      reconnectDelay: 5000,

      onConnect: () => {
        console.log('Connected')

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const body = JSON.parse(message.body)
          onMessage(body)
        })
      },

      onStompError: (frame) => {
        console.error(frame)
      },
    })

    client.activate()
    stompClient.current = client

    return () => {
      client.deactivate()
    }
  }, [roomId, onMessage])

  const sendMessage = (content) => {
    if (!stompClient.current || !roomId) return

    stompClient.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify({
        content,
      }),
    })
  }

  return { sendMessage }
}
