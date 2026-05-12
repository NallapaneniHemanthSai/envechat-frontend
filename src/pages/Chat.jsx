import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import MessageBubble from '../components/chat/MessageBubble'

const API_BASE = 'https://envechat.onrender.com'

export default function Chat() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')

  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])

  const stompClientRef = useRef(null)
  const subscriptionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE}/api/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(r => r.json())
      .then(data => {
        setRooms(data)

        if (data.length > 0) {
          setActiveRoom(data[0])
        }
      })
      .catch(err =>
        console.error('Failed to load rooms:', err)
      )
  }, [token])

  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${API_BASE}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 3000,

      onConnect: () => {
        setConnected(true)
        stompClientRef.current = client
      },

      onDisconnect: () => {
        setConnected(false)
      },

      onStompError: frame => {
        console.error('STOMP error', frame)
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [token])

  useEffect(() => {
    if (
      !connected ||
      !activeRoom ||
      !stompClientRef.current
    ) {
      return
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    fetch(
      `${API_BASE}/api/chat/${activeRoom.id}/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(r => r.json())
      .then(setMessages)
      .catch(err =>
        console.error('Failed to load history:', err)
      )

    subscriptionRef.current =
      stompClientRef.current.subscribe(
        `/topic/room/${activeRoom.id}`,
        frame => {
          const msg = JSON.parse(frame.body)

          if (msg.type === 'TYPING') {
            handleTypingIndicator(msg)
            return
          }

          setMessages(prev => [...prev, msg])
        }
      )

    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}/join`,
      body: JSON.stringify({
        type: 'JOIN',
        senderUsername: username,
      }),
    })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [connected, activeRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleTypingIndicator = useCallback(
    msg => {
      if (msg.senderUsername === username) return

      setTypingUsers(prev => [
        ...new Set([...prev, msg.senderUsername]),
      ])

      clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(prev =>
          prev.filter(
            u => u !== msg.senderUsername
          )
        )
      }, 2000)
    },
    [username]
  )

  const sendTypingEvent = useCallback(() => {
    if (!stompClientRef.current || !activeRoom) {
      return
    }

    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({
        type: 'TYPING',
        senderUsername: username,
      }),
    })
  }, [activeRoom, username])

  const sendMessage = useCallback(() => {
    const text = inputText.trim()

    if (
      !text ||
      !stompClientRef.current ||
      !activeRoom
    ) {
      return
    }

    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({
        content: text,
        type: 'CHAT',
        senderUsername: username,
        roomId: String(activeRoom.id),
      }),
    })

    setInputText('')
  }, [inputText, activeRoom, username])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const createRoom = async () => {
    const name = newRoomName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')

    if (!name) return

    try {
      const res = await fetch(
        `${API_BASE}/api/rooms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      )

      if (!res.ok) {
        console.error(
          'Create room failed:',
          await res.text()
        )
        return
      }

      const room = await res.json()

      setRooms(prev => [...prev, room])
      setActiveRoom(room)
      setNewRoomName('')
      setShowModal(false)
    } catch (e) {
      console.error('Create room error:', e)
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const getInitials = name =>
    (name || '??').slice(0, 2).toUpperCase()

  const formatTime = ts =>
    ts
      ? new Date(ts).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

  const avatarColors = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'linear-gradient(135deg,#22c55e,#16a34a)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
  ]

  const getAvatarColor = name => {
    let h = 0

    for (const c of name || '') {
      h =
        (h * 31 + c.charCodeAt(0)) %
        avatarColors.length
    }

    return avatarColors[h]
  }

  const s = {
    shell: {
      display: 'flex',
      height: '100vh',
      background: '#0f172a',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden',
    },

    sidebar: {
      width: 260,
      background: '#1e293b',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },

    sidebarHeader: {
      padding: '16px',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    logo: {
      fontSize: 16,
      fontWeight: 700,
      color: '#38bdf8',
    },

    userPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: '#94a3b8',
    },

    avatar: name => ({
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: getAvatarColor(name),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 600,
      color: '#fff',
      flexShrink: 0,
    }),

    sectionLabel: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      color: '#475569',
      padding: '12px 16px 6px',
      textTransform: 'uppercase',
    },

    roomsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 8px',
    },

    roomItem: active => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      marginBottom: 4,
      transition: 'all 0.2s ease',
      background: active
        ? 'rgba(56,189,248,0.12)'
        : 'transparent',
      border: active
        ? '1px solid rgba(56,189,248,0.2)'
        : '1px solid transparent',
    }),

    roomHash: active => ({
      fontFamily: 'monospace',
      fontSize: 14,
      color: active ? '#38bdf8' : '#475569',
    }),

    roomName: active => ({
      fontSize: 13,
      color: active ? '#f1f5f9' : '#94a3b8',
      flex: 1,
    }),

    newRoomBtn: {
      margin: 8,
      padding: '10px 12px',
      border: '1px dashed #334155',
      borderRadius: 10,
      background: 'transparent',
      color: '#64748b',
      fontSize: 12,
      cursor: 'pointer',
    },

    sidebarFooter: {
      padding: 12,
      borderTop: '1px solid #334155',
    },

    logoutBtn: {
      width: '100%',
      padding: 10,
      background: 'transparent',
      border: '1px solid #334155',
      borderRadius: 10,
      color: '#94a3b8',
      fontSize: 12,
      cursor: 'pointer',
    },

    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },

    chatHeader: {
      padding: '16px 24px',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#1e293b',
    },

    roomTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#f8fafc',
    },

    connDot: ok => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: ok ? '#22c55e' : '#ef4444',
      display: 'inline-block',
      marginRight: 6,
    }),

    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      background:
        'linear-gradient(to bottom, #0f172a, #020617)',
    },

    systemMsg: {
      textAlign: 'center',
      fontSize: 12,
      color: '#64748b',
      padding: '6px 0',
      fontStyle: 'italic',
    },

    inputArea: {
      padding: '18px 24px',
      borderTop: '1px solid #334155',
      background: '#111827',
    },

    inputRow: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-end',
      maxWidth: 1100,
      width: '100%',
      margin: '0 auto',
    },

    msgInput: {
      flex: 1,
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 16,
      padding: '14px 16px',
      color: '#f8fafc',
      fontFamily: 'inherit',
      fontSize: 14,
      resize: 'none',
      outline: 'none',
      minHeight: 52,
    },

    sendBtn: {
      background: '#0ea5e9',
      border: 'none',
      borderRadius: 16,
      width: 52,
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      flexShrink: 0,
    },

    inputHint: {
      fontSize: 11,
      color: '#64748b',
      marginTop: 8,
      textAlign: 'center',
    },
  }

  return (
    <div style={s.shell}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <span style={s.logo}>EnveChat</span>

          <div style={s.userPill}>
            <div style={s.avatar(username)}>
              {getInitials(username)}
            </div>
            <span>{username}</span>
          </div>
        </div>

        <div style={s.sectionLabel}>Rooms</div>

        <div style={s.roomsList}>
          {rooms.map(room => (
            <div
              key={room.id}
              style={s.roomItem(
                activeRoom?.id === room.id
              )}
              onClick={() => setActiveRoom(room)}
            >
              <span
                style={s.roomHash(
                  activeRoom?.id === room.id
                )}
              >
                #
              </span>

              <span
                style={s.roomName(
                  activeRoom?.id === room.id
                )}
              >
                {room.name}
              </span>
            </div>
          ))}
        </div>

        <button
          style={s.newRoomBtn}
          onClick={() => setShowModal(true)}
        >
          + New Room
        </button>

        <div style={s.sidebarFooter}>
          <button
            style={s.logoutBtn}
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.chatHeader}>
          <span style={s.roomTitle}>
            {activeRoom
              ? `# ${activeRoom.name}`
              : 'Select a room'}
          </span>

          <span
            style={{
              fontSize: 12,
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={s.connDot(connected)} />
            {connected
              ? 'Connected'
              : 'Connecting...'}
          </span>
        </div>

        <div style={s.messagesArea}>
          <div
            style={{
              maxWidth: 1100,
              width: '100%',
              margin: '0 auto',
            }}
          >
            {messages.map((msg, i) => {
              if (msg.type === 'JOIN') {
                return (
                  <div
                    key={i}
                    style={s.systemMsg}
                  >
                    {msg.senderUsername} joined
                  </div>
                )
              }

              if (msg.type === 'LEAVE') {
                return (
                  <div
                    key={i}
                    style={s.systemMsg}
                  >
                    {msg.senderUsername} left
                  </div>
                )
              }

              const own =
                msg.senderUsername === username

              return (
                <MessageBubble
                  key={i}
                  own={own}
                  sender={msg.senderUsername}
                  content={msg.content}
                  timestamp={formatTime(
                    msg.sentAt
                  )}
                  initials={getInitials(
                    msg.senderUsername
                  )}
                  avatarStyle={s.avatar(
                    msg.senderUsername
                  )}
                />
              )
            })}

            {typingUsers.length > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  padding: '6px 4px',
                  fontStyle: 'italic',
                }}
              >
                {typingUsers.join(', ')}{' '}
                {typingUsers.length === 1
                  ? 'is'
                  : 'are'}{' '}
                typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div style={s.inputArea}>
          <div style={s.inputRow}>
            <textarea
              style={s.msgInput}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value)
                sendTypingEvent()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type message..."
              disabled={!connected}
            />

            <button
              style={s.sendBtn}
              onClick={sendMessage}
            >
              ➤
            </button>
          </div>

          <div style={s.inputHint}>
            Enter to send · Shift+Enter for new
            line
          </div>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 400,
              background: '#111827',
              border: '1px solid #334155',
              borderRadius: 24,
              padding: 28,
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <h2
              style={{
                color: '#f8fafc',
                fontSize: 22,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Create Room
            </h2>

            <p
              style={{
                color: '#64748b',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Start a new realtime conversation
              room.
            </p>

            <input
              value={newRoomName}
              onChange={e =>
                setNewRoomName(e.target.value)
              }
              placeholder="room name"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  createRoom()
                }
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 14,
                color: '#f8fafc',
                fontSize: 14,
                outline: 'none',
                marginBottom: 22,
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}
            >
              <button
                onClick={() =>
                  setShowModal(false)
                }
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={createRoom}
                style={{
                  padding: '12px 18px',
                  background:
                    'linear-gradient(135deg,#0ea5e9,#0284c7)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}