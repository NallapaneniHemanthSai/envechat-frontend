import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

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

  // Auth guard
  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  // Load rooms on mount
  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/api/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setRooms(data)
        if (data.length > 0) setActiveRoom(data[0])
      })
      .catch(err => console.error('Failed to load rooms:', err))
  }, [token])

  // Connect WebSocket
  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        stompClientRef.current = client
      },
      onDisconnect: () => setConnected(false),
      onStompError: frame => console.error('STOMP error', frame),
    })

    client.activate()

    return () => client.deactivate()
  }, [token])

  // Subscribe to active room
  useEffect(() => {
    if (!connected || !activeRoom || !stompClientRef.current) return

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Load message history
    fetch(`${API_BASE}/api/chat/${activeRoom.id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setMessages)
      .catch(err => console.error('Failed to load history:', err))

    // Subscribe to room messages
    subscriptionRef.current = stompClientRef.current.subscribe(
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

    // Announce join
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}/join`,
      body: JSON.stringify({ type: 'JOIN', senderUsername: username }),
    })

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
    }
  }, [connected, activeRoom]) // eslint-disable-line

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Typing indicator
  const handleTypingIndicator = useCallback(msg => {
    if (msg.senderUsername === username) return
    setTypingUsers(prev => [...new Set([...prev, msg.senderUsername])])
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u !== msg.senderUsername))
    }, 2000)
  }, [username])

  const sendTypingEvent = useCallback(() => {
    if (!stompClientRef.current || !activeRoom) return
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({ type: 'TYPING', senderUsername: username }),
    })
  }, [activeRoom, username])

  // Send message
  const sendMessage = useCallback(() => {
    const text = inputText.trim()
    if (!text || !stompClientRef.current || !activeRoom) return
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

  // Create room
  const createRoom = async () => {
    const name = newRoomName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name) return
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        console.error('Create room failed:', await res.text())
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

  const getInitials = name => (name || '??').slice(0, 2).toUpperCase()
  const formatTime = ts => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  const avatarColors = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'linear-gradient(135deg,#22c55e,#16a34a)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
  ]
  const getAvatarColor = name => {
    let h = 0
    for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % avatarColors.length
    return avatarColors[h]
  }

  const s = {
    shell: { display: 'flex', height: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' },
    sidebar: { width: 260, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    sidebarHeader: { padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: 16, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' },
    userPill: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' },
    avatar: name => ({ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0 }),
    sectionLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#475569', padding: '12px 16px 6px', textTransform: 'uppercase' },
    roomsList: { flex: 1, overflowY: 'auto', padding: '4px 8px' },
    roomItem: active => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: active ? 'rgba(56,189,248,0.12)' : 'transparent', border: active ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent' }),
    roomHash: active => ({ fontFamily: 'monospace', fontSize: 14, color: active ? '#38bdf8' : '#475569' }),
    roomName: active => ({ fontSize: 13, color: active ? '#f1f5f9' : '#94a3b8', flex: 1 }),
    newRoomBtn: { margin: 8, padding: '8px 12px', border: '1px dashed #334155', borderRadius: 8, background: 'transparent', color: '#475569', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' },
    sidebarFooter: { padding: 12, borderTop: '1px solid #334155' },
    logoutBtn: { width: '100%', padding: 8, background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    chatHeader: { padding: '14px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b' },
    roomTitle: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
    connDot: ok => ({ width: 7, height: 7, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', display: 'inline-block', marginRight: 5 }),
    messagesArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 4 },
    msgRow: own => ({ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '2px 0', flexDirection: own ? 'row-reverse' : 'row' }),
    msgBubble: own => ({ background: own ? 'rgba(56,189,248,0.1)' : '#1e293b', border: own ? '1px solid rgba(56,189,248,0.2)' : '1px solid #334155', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.6, color: '#f1f5f9', maxWidth: '70%', wordBreak: 'break-word' }),
    msgMeta: own => ({ fontSize: 11, color: '#475569', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6, flexDirection: own ? 'row-reverse' : 'row' }),
    sender: { fontWeight: 500, color: '#94a3b8' },
    systemMsg: { textAlign: 'center', fontSize: 12, color: '#475569', padding: '4px 0', fontStyle: 'italic' },
    inputArea: { padding: '16px 20px', borderTop: '1px solid #334155', background: '#1e293b' },
    inputRow: { display: 'flex', gap: 10, alignItems: 'flex-end' },
    msgInput: { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontFamily: 'inherit', fontSize: 13, resize: 'none', outline: 'none', minHeight: 40, maxHeight: 120 },
    sendBtn: { background: '#0ea5e9', border: 'none', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 },
    inputHint: { fontSize: 11, color: '#475569', marginTop: 6 },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24, width: 320 },
    modalInput: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontFamily: 'inherit', fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' },
  }

  return (
    <div style={s.shell}>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <span style={s.logo}>EnveChat</span>
          <div style={s.userPill}>
            <div style={s.avatar(username)}>{getInitials(username)}</div>
            <span>{username}</span>
          </div>
        </div>

        <div style={s.sectionLabel}>Rooms</div>
        <div style={s.roomsList}>
          {rooms.length === 0 && (
            <div style={{ fontSize: 12, color: '#475569', padding: '8px 10px' }}>
              No rooms yet — create one!
            </div>
          )}
          {rooms.map(room => (
            <div
              key={room.id}
              style={s.roomItem(activeRoom?.id === room.id)}
              onClick={() => setActiveRoom(room)}
            >
              <span style={s.roomHash(activeRoom?.id === room.id)}>#</span>
              <span style={s.roomName(activeRoom?.id === room.id)}>{room.name}</span>
            </div>
          ))}
        </div>

        <button style={s.newRoomBtn} onClick={() => setShowModal(true)}>
          + New Room
        </button>

        <div style={s.sidebarFooter}>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div style={s.main}>
        <div style={s.chatHeader}>
          <span style={s.roomTitle}>
            {activeRoom ? `# ${activeRoom.name}` : 'Select a room to start chatting'}
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            <span style={s.connDot(connected)} />
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        <div style={s.messagesArea}>
          {!activeRoom && (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#475569', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div>Select or create a room to start chatting</div>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.type === 'JOIN') return <div key={i} style={s.systemMsg}>{msg.senderUsername} joined</div>
            if (msg.type === 'LEAVE') return <div key={i} style={s.systemMsg}>{msg.senderUsername} left</div>
            const own = msg.senderUsername === username
            return (
              <div key={i} style={s.msgRow(own)}>
                <div style={{ ...s.avatar(msg.senderUsername), width: 32, height: 32, borderRadius: 8, fontSize: 11, marginTop: 2 }}>
                  {getInitials(msg.senderUsername)}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={s.msgMeta(own)}>
                    <span style={s.sender}>{own ? 'you' : msg.senderUsername}</span>
                    <span>{formatTime(msg.sentAt)}</span>
                  </div>
                  <div style={s.msgBubble(own)}>{msg.content}</div>
                </div>
              </div>
            )
          })}

          {typingUsers.length > 0 && (
            <div style={{ fontSize: 12, color: '#475569', padding: '4px 0', fontStyle: 'italic' }}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={s.inputArea}>
          <div style={s.inputRow}>
            <textarea
              style={s.msgInput}
              value={inputText}
              onChange={e => { setInputText(e.target.value); sendTypingEvent() }}
              onKeyDown={handleKeyDown}
              placeholder={activeRoom ? `Message #${activeRoom.name}…` : 'Select a room first'}
              disabled={!activeRoom || !connected}
              rows={1}
            />
            <button style={s.sendBtn} onClick={sendMessage} disabled={!activeRoom || !connected}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={s.inputHint}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showModal && (
        <div
          style={s.modalOverlay}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={s.modal}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, marginTop: 0 }}>
              Create a new room
            </h3>
            <input
              style={s.modalInput}
              type="text"
              placeholder="e.g. dev-talk"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createRoom()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => { setShowModal(false); setNewRoomName('') }}
              >
                Cancel
              </button>
              <button
                style={{ padding: '8px 16px', background: '#0ea5e9', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
                onClick={createRoom}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
