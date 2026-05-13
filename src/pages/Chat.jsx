import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE = 'https://envechat.onrender.com'

/* ─── Cold-Start Banner ─────────────────────────────────────── */
function ColdStartBanner({ elapsed, onDismiss }) {
  const TOTAL = 120
  const pct = Math.min((elapsed / TOTAL) * 100, 100)
  const remaining = TOTAL - elapsed
  const m = Math.floor(remaining / 60)
  const sec = remaining % 60
  return (
    <div style={banner.wrap}>
      <div style={banner.left}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{flexShrink:0}}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={banner.text}>
          Server cold-starting…&nbsp;
          <strong style={{color:'#93c5fd'}}>
            {elapsed >= TOTAL ? 'should be ready now!' : `~${m}:${String(sec).padStart(2,'0')} remaining`}
          </strong>
        </span>
      </div>
      <div style={banner.right}>
        <div style={banner.track}><div style={{...banner.fill, width:`${pct}%`}} /></div>
        <button style={banner.close} onClick={onDismiss}>✕</button>
      </div>
    </div>
  )
}

/* ─── Helpers ───────────────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#e879f9,#a855f7)',
]
const getGrad = name => {
  let h = 0; for (const c of (name||'')) h=(h*31+c.charCodeAt(0))%AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[h]
}
const initials = name => (name||'??').slice(0,2).toUpperCase()
const fmtTime = ts => ts ? new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ name, size=32, radius=8 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:getGrad(name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.34, fontWeight:600, color:'#fff', flexShrink:0, letterSpacing:'-0.02em' }}>
      {initials(name)}
    </div>
  )
}

/* ─── Message Bubble ────────────────────────────────────────── */
function Message({ msg, own }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'3px 0', flexDirection: own ? 'row-reverse' : 'row' }}>
      <Avatar name={msg.senderUsername} size={32} />
      <div style={{ maxWidth:'70%' }}>
        <div style={{ fontSize:11, color:'#475569', marginBottom:4, display:'flex', alignItems:'center', gap:6, flexDirection: own ? 'row-reverse' : 'row' }}>
          <span style={{ fontWeight:500, color: own ? '#60a5fa' : '#94a3b8' }}>
            {own ? 'you' : msg.senderUsername}
          </span>
          <span>{fmtTime(msg.sentAt)}</span>
        </div>
        <div style={{
          background: own ? 'rgba(59,130,246,0.12)' : 'rgba(30,41,59,0.8)',
          border: own ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(148,163,184,0.1)',
          padding:'9px 13px', borderRadius: own ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          fontSize:13.5, lineHeight:1.6, color:'#e2e8f0', wordBreak:'break-word'
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Chat ─────────────────────────────────────────────── */
export default function Chat() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const token    = localStorage.getItem('token')

  const [rooms, setRooms]           = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages]     = useState([])
  const [inputText, setInputText]   = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [connected, setConnected]   = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Cold-start
  const [showBanner, setShowBanner]   = useState(false)
  const [bannerElapsed, setBannerElapsed] = useState(0)
  const bannerTimerRef = useRef(null)

  const stompClientRef   = useRef(null)
  const subscriptionRef  = useRef(null)
  const messagesEndRef   = useRef(null)
  const typingTimeoutRef = useRef({})

  useEffect(() => { if (!token) navigate('/login') }, [token, navigate])

  // Start cold-start timer when not connected after 5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!connected) {
        setShowBanner(true)
        bannerTimerRef.current = setInterval(() => setBannerElapsed(e => e + 1), 1000)
      }
    }, 5000)
    return () => clearTimeout(timeout)
  }, [connected])

  useEffect(() => {
    if (connected && bannerTimerRef.current) {
      clearInterval(bannerTimerRef.current)
      setBannerElapsed(0)
      setShowBanner(false)
    }
  }, [connected])

  // Load rooms
  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/api/rooms`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setRooms(data); if (data.length > 0) setActiveRoom(data[0]) })
      .catch(console.error)
  }, [token])

  // Connect WebSocket
  useEffect(() => {
    if (!token) return
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization:`Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => { setConnected(true); stompClientRef.current = client },
      onDisconnect: () => setConnected(false),
      onStompError: frame => console.error('STOMP', frame),
    })
    client.activate()
    return () => client.deactivate()
  }, [token])

  // Subscribe to active room
  useEffect(() => {
    if (!connected || !activeRoom || !stompClientRef.current) return
    subscriptionRef.current?.unsubscribe()

    fetch(`${API_BASE}/api/chat/${activeRoom.id}/history`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json()).then(setMessages).catch(console.error)

    subscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/room/${activeRoom.id}`,
      frame => {
        const msg = JSON.parse(frame.body)
        if (msg.type === 'TYPING') { handleTyping(msg); return }
        setMessages(prev => [...prev, msg])
      }
    )
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}/join`,
      body: JSON.stringify({ type:'JOIN', senderUsername:username }),
    })
    return () => subscriptionRef.current?.unsubscribe()
  }, [connected, activeRoom]) // eslint-disable-line

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const handleTyping = useCallback(msg => {
    if (msg.senderUsername === username) return
    const u = msg.senderUsername
    setTypingUsers(prev => [...new Set([...prev, u])])
    clearTimeout(typingTimeoutRef.current[u])
    typingTimeoutRef.current[u] = setTimeout(() => {
      setTypingUsers(prev => prev.filter(x => x !== u))
    }, 2500)
  }, [username])

  const sendTypingEvent = useCallback(() => {
    if (!stompClientRef.current || !activeRoom) return
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({ type:'TYPING', senderUsername:username }),
    })
  }, [activeRoom, username])

  const sendMessage = useCallback(() => {
    const text = inputText.trim()
    if (!text || !stompClientRef.current || !activeRoom) return
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({ content:text, type:'CHAT', senderUsername:username, roomId:String(activeRoom.id) }),
    })
    setInputText('')
  }, [inputText, activeRoom, username])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const createRoom = async () => {
    const name = newRoomName.trim().toLowerCase().replace(/\s+/g,'-')
    if (!name) return
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      const room = await res.json()
      setRooms(prev => [...prev, room])
      setActiveRoom(room)
      setNewRoomName('')
      setShowModal(false)
    } catch(e) { console.error(e) }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <>
      <div style={s.shell}>
        {/* SIDEBAR */}
        <div style={{ ...s.sidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition:'transform 0.25s ease' }}>
          <div style={s.sidebarTop}>
            <div style={s.brand}>
              <div style={s.brandIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={s.brandName}>EnveChat</span>
            </div>
            <div style={s.userChip}>
              <Avatar name={username} size={26} radius={6} />
              <span style={s.userChipName}>{username}</span>
            </div>
          </div>

          <div style={s.sectionLabel}>Channels</div>

          <div style={s.roomsList}>
            {rooms.length === 0 && (
              <div style={s.emptyRooms}>No channels yet — create one!</div>
            )}
            {rooms.map(room => {
              const active = activeRoom?.id === room.id
              return (
                <div key={room.id} style={{ ...s.roomItem, ...(active ? s.roomItemActive : {}) }}
                  onClick={() => setActiveRoom(room)}>
                  <span style={{ ...s.roomHash, color: active ? '#60a5fa' : '#475569' }}>#</span>
                  <span style={{ ...s.roomName, color: active ? '#f1f5f9' : '#94a3b8' }}>{room.name}</span>
                </div>
              )
            })}
          </div>

          <button style={s.newRoomBtn} onClick={() => setShowModal(true)}>
            <span style={s.newRoomPlus}>+</span> New Channel
          </button>

          <div style={s.sidebarFooter}>
            <div style={s.connStatus}>
              <span style={{ ...s.connDot, background: connected ? '#22c55e' : '#ef4444',
                boxShadow: connected ? '0 0 6px #22c55e' : 'none' }} />
              <span style={s.connLabel}>{connected ? 'Connected' : 'Connecting…'}</span>
            </div>
            <button style={s.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* MAIN */}
        <div style={s.main}>
          {showBanner && (
            <ColdStartBanner elapsed={bannerElapsed} onDismiss={() => setShowBanner(false)} />
          )}

          {/* Header */}
          <div style={s.chatHeader}>
            <div style={s.headerLeft}>
              <button style={s.sidebarToggle} onClick={() => setSidebarOpen(o => !o)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              {activeRoom ? (
                <div>
                  <div style={s.headerRoom}># {activeRoom.name}</div>
                </div>
              ) : (
                <div style={s.headerRoom}>Select a channel</div>
              )}
            </div>
            <div style={s.headerRight}>
              <div style={s.memberCount}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={s.messagesArea}>
            {!activeRoom && (
              <div style={s.emptyChat}>
                <div style={s.emptyChatIcon}>💬</div>
                <div style={s.emptyChatTitle}>No channel selected</div>
                <div style={s.emptyChatSub}>Pick a channel from the sidebar or create a new one</div>
              </div>
            )}

            {activeRoom && messages.length === 0 && (
              <div style={s.channelIntro}>
                <div style={s.channelIntroIcon}>#</div>
                <div style={s.channelIntroTitle}>Welcome to #{activeRoom.name}</div>
                <div style={s.channelIntroSub}>This is the beginning of #{activeRoom.name}. Say hello!</div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.type === 'JOIN') return <div key={i} style={s.systemMsg}><span style={s.systemDot}/>{msg.senderUsername} joined the channel</div>
              if (msg.type === 'LEAVE') return <div key={i} style={s.systemMsg}><span style={s.systemDot}/>{msg.senderUsername} left</div>
              return <Message key={i} msg={msg} own={msg.senderUsername === username} />
            })}

            {typingUsers.length > 0 && (
              <div style={s.typingRow}>
                <div style={s.typingDots}>
                  {[0,1,2].map(i => <span key={i} style={{ ...s.typingDot, animationDelay:`${i*0.2}s` }} />)}
                </div>
                <span style={s.typingText}>
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            <div style={s.inputWrap}>
              <textarea
                style={s.textarea}
                value={inputText}
                onChange={e => { setInputText(e.target.value); sendTypingEvent() }}
                onKeyDown={handleKeyDown}
                placeholder={activeRoom ? `Message #${activeRoom.name}…` : 'Select a channel first'}
                disabled={!activeRoom || !connected}
                rows={1}
              />
              <button style={{ ...s.sendBtn, opacity: (!activeRoom || !connected || !inputText.trim()) ? 0.4 : 1 }}
                onClick={sendMessage} disabled={!activeRoom || !connected || !inputText.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={s.inputHint}>Enter ↵ to send  ·  Shift+Enter for new line</div>
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showModal && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Create a new channel</span>
              <button style={s.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p style={s.modalSub}>Channel names are lowercase with dashes</p>
            <div style={s.modalInputWrap}>
              <span style={s.modalHash}>#</span>
              <input
                style={s.modalInput}
                type="text"
                placeholder="e.g. dev-talk"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                autoFocus
              />
            </div>
            <div style={s.modalActions}>
              <button style={s.modalCancel} onClick={() => { setShowModal(false); setNewRoomName('') }}>Cancel</button>
              <button style={s.modalCreate} onClick={createRoom}>Create Channel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 99px; }
        textarea::-webkit-scrollbar { width: 4px; }
      `}</style>
    </>
  )
}

/* ─── Styles ────────────────────────────────────────────────── */
const s = {
  shell: { display:'flex', height:'100vh', background:'#030712', fontFamily:"'Sora',sans-serif", overflow:'hidden' },

  // Sidebar
  sidebar: { width:258, background:'#0a1628', borderRight:'1px solid rgba(148,163,184,0.08)', display:'flex', flexDirection:'column', flexShrink:0, position:'relative', zIndex:10 },
  sidebarTop: { padding:'18px 16px 14px', borderBottom:'1px solid rgba(148,163,184,0.08)' },
  brand: { display:'flex', alignItems:'center', gap:9, marginBottom:14 },
  brandIcon: { width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  brandName: { fontSize:16, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.02em' },
  userChip: { display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(30,41,59,0.6)', borderRadius:10, border:'1px solid rgba(148,163,184,0.08)' },
  userChipName: { fontSize:12, color:'#94a3b8', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  sectionLabel: { fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'#334155', padding:'14px 16px 6px', textTransform:'uppercase' },
  roomsList: { flex:1, overflowY:'auto', padding:'4px 10px' },
  emptyRooms: { fontSize:12, color:'#334155', padding:'10px 6px' },
  roomItem: { display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', marginBottom:2, border:'1px solid transparent', transition:'background 0.15s' },
  roomItemActive: { background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' },
  roomHash: { fontFamily:'monospace', fontSize:15, fontWeight:700 },
  roomName: { fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  newRoomBtn: { margin:'8px 10px', padding:'8px 12px', border:'1px dashed rgba(148,163,184,0.15)', borderRadius:9, background:'transparent', color:'#475569', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:"'Sora',sans-serif", transition:'color 0.15s, border-color 0.15s' },
  newRoomPlus: { fontSize:16, lineHeight:1 },
  sidebarFooter: { padding:'12px', borderTop:'1px solid rgba(148,163,184,0.08)', display:'flex', flexDirection:'column', gap:8 },
  connStatus: { display:'flex', alignItems:'center', gap:7, padding:'6px 10px' },
  connDot: { width:7, height:7, borderRadius:'50%', flexShrink:0, transition:'background 0.3s, box-shadow 0.3s' },
  connLabel: { fontSize:11, color:'#475569' },
  logoutBtn: { width:'100%', padding:'8px', background:'transparent', border:'1px solid rgba(148,163,184,0.1)', borderRadius:8, color:'#475569', fontSize:12, cursor:'pointer', fontFamily:"'Sora',sans-serif", transition:'color 0.15s' },

  // Main
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#050d1a' },
  chatHeader: { padding:'14px 20px', borderBottom:'1px solid rgba(148,163,184,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(10,22,40,0.9)', backdropFilter:'blur(12px)', flexShrink:0 },
  headerLeft: { display:'flex', alignItems:'center', gap:12 },
  sidebarToggle: { background:'transparent', border:'none', color:'#475569', cursor:'pointer', padding:4, display:'flex', alignItems:'center' },
  headerRoom: { fontSize:15, fontWeight:600, color:'#f1f5f9', letterSpacing:'-0.01em' },
  headerRight: { display:'flex', alignItems:'center', gap:12 },
  memberCount: { display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#475569' },

  messagesArea: { flex:1, overflowY:'auto', padding:'24px 24px 8px', display:'flex', flexDirection:'column', gap:4 },
  emptyChat: { margin:'auto', textAlign:'center', color:'#334155' },
  emptyChatIcon: { fontSize:40, marginBottom:12 },
  emptyChatTitle: { fontSize:16, fontWeight:600, color:'#475569', marginBottom:6 },
  emptyChatSub: { fontSize:13, color:'#334155' },
  channelIntro: { padding:'20px 0 28px', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:6, borderBottom:'1px solid rgba(148,163,184,0.06)', marginBottom:16 },
  channelIntroIcon: { fontSize:42, fontWeight:800, color:'#1e3a5f', lineHeight:1, fontFamily:'monospace' },
  channelIntroTitle: { fontSize:22, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.02em' },
  channelIntroSub: { fontSize:13, color:'#475569' },
  systemMsg: { display:'flex', alignItems:'center', gap:7, textAlign:'left', fontSize:11.5, color:'#334155', padding:'6px 0', fontStyle:'italic' },
  systemDot: { width:5, height:5, borderRadius:'50%', background:'#1e3a5f', flexShrink:0 },
  typingRow: { display:'flex', alignItems:'center', gap:8, padding:'4px 0' },
  typingDots: { display:'flex', gap:3 },
  typingDot: { width:5, height:5, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animation:'bounce 1.2s ease-in-out infinite' },
  typingText: { fontSize:11, color:'#475569', fontStyle:'italic' },

  inputArea: { padding:'16px 20px 18px', borderTop:'1px solid rgba(148,163,184,0.08)', background:'rgba(10,22,40,0.9)', flexShrink:0 },
  inputWrap: { display:'flex', alignItems:'flex-end', gap:10, background:'rgba(20,32,54,0.8)', border:'1px solid rgba(148,163,184,0.12)', borderRadius:12, padding:'4px 4px 4px 14px' },
  textarea: { flex:1, background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontFamily:"'Sora',sans-serif", fontSize:13.5, resize:'none', padding:'8px 0', minHeight:38, maxHeight:120, lineHeight:1.6 },
  sendBtn: { width:38, height:38, background:'linear-gradient(135deg,#3b82f6,#6366f1)', border:'none', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', flexShrink:0, transition:'opacity 0.2s' },
  inputHint: { fontSize:10.5, color:'#1e3a5f', marginTop:7, letterSpacing:'0.01em' },

  // Modal
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#0a1628', border:'1px solid rgba(148,163,184,0.12)', borderRadius:16, padding:'28px', width:360, boxShadow:'0 30px 60px rgba(0,0,0,0.6)', animation:'fadeSlide 0.2s ease' },
  modalHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  modalTitle: { fontSize:16, fontWeight:600, color:'#f1f5f9' },
  modalClose: { background:'transparent', border:'none', color:'#475569', fontSize:16, cursor:'pointer', lineHeight:1, padding:2 },
  modalSub: { fontSize:12, color:'#475569', marginBottom:16 },
  modalInputWrap: { display:'flex', alignItems:'center', gap:8, background:'rgba(30,41,59,0.8)', border:'1px solid rgba(148,163,184,0.15)', borderRadius:10, padding:'10px 14px', marginBottom:18 },
  modalHash: { fontFamily:'monospace', fontSize:16, fontWeight:700, color:'#475569' },
  modalInput: { flex:1, background:'transparent', border:'none', outline:'none', color:'#f1f5f9', fontFamily:"'Sora',sans-serif", fontSize:14 },
  modalActions: { display:'flex', gap:8, justifyContent:'flex-end' },
  modalCancel: { padding:'9px 18px', background:'transparent', border:'1px solid rgba(148,163,184,0.15)', borderRadius:8, color:'#94a3b8', fontSize:13, cursor:'pointer', fontFamily:"'Sora',sans-serif" },
  modalCreate: { padding:'9px 18px', background:'linear-gradient(135deg,#3b82f6,#6366f1)', border:'none', borderRadius:8, color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600, fontFamily:"'Sora',sans-serif" },
}

/* ─── Cold-start banner styles ──────────────────────────────── */
const banner = {
  wrap: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'9px 16px', background:'rgba(30,58,138,0.3)', borderBottom:'1px solid rgba(59,130,246,0.2)', flexShrink:0, animation:'fadeSlide 0.3s ease' },
  left: { display:'flex', alignItems:'center', gap:8 },
  text: { fontSize:12, color:'#93c5fd' },
  right: { display:'flex', alignItems:'center', gap:10 },
  track: { width:100, height:4, background:'rgba(148,163,184,0.15)', borderRadius:99, overflow:'hidden' },
  fill: { height:'100%', background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius:99, transition:'width 1s linear' },
  close: { background:'transparent', border:'none', color:'#475569', cursor:'pointer', fontSize:13, lineHeight:1, padding:2 },
}
