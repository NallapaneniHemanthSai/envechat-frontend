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
    <div style={ban.wrap}>
      <div style={ban.left}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{flexShrink:0}}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={ban.text}>
          Server cold-starting —&nbsp;
          <strong style={{color:'#93c5fd'}}>
            {elapsed >= TOTAL ? 'should be ready now, try reconnecting!' : `~${m}:${String(sec).padStart(2,'0')} remaining`}
          </strong>
          <span style={{color:'#475569'}}>&nbsp;· Free-tier Render wakeup</span>
        </span>
      </div>
      <div style={ban.right}>
        <div style={ban.track}><div style={{...ban.fill, width:`${pct}%`}} /></div>
        <button style={ban.close} onClick={onDismiss} title="Dismiss">✕</button>
      </div>
    </div>
  )
}

/* ─── Helpers ───────────────────────────────────────────────── */
const GRADS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#e879f9,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
]
const getGrad = name => {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % GRADS.length
  return GRADS[h]
}
// Strip @domain if it looks like an email — show only the username part
const displayName = name => {
  if (!name) return '??'
  return name.includes('@') ? name.split('@')[0] : name
}
const initials = name => displayName(name).slice(0, 2).toUpperCase()
const fmtTime  = ts => ts ? new Date(ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ name, size = 34, radius = 9 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: getGrad(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.02em', userSelect: 'none',
    }}>
      {initials(name)}
    </div>
  )
}

/* ─── Message Group (consecutive msgs from same sender) ─────── */
function MessageGroup({ msgs, own }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '4px 0',
      flexDirection: own ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
    }}>
      <div style={{ flexShrink:0, width:34 }}>
        <Avatar name={msgs[0].senderUsername} size={34} />
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 3,
        maxWidth: '62%', alignItems: own ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          fontSize: 11, color: '#475569', display: 'flex',
          alignItems: 'center', gap: 6,
          flexDirection: own ? 'row-reverse' : 'row', marginBottom: 2,
        }}>
          <span style={{ fontWeight: 600, color: own ? '#60a5fa' : '#94a3b8' }}>
            {own ? 'you' : displayName(msgs[0].senderUsername)}
          </span>
          <span>{fmtTime(msgs[0].sentAt)}</span>
        </div>
        {msgs.map((msg, i) => {
          const first = i === 0
          const last  = i === msgs.length - 1
          return (
            <div key={i} style={{
              background: own ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)',
              border: own ? '1px solid rgba(59,130,246,0.28)' : '1px solid rgba(255,255,255,0.07)',
              padding: '9px 14px',
              borderRadius: own
                ? (first ? '14px 4px 14px 14px' : last ? '14px 14px 4px 14px' : '14px 8px 14px 14px')
                : (first ? '4px 14px 14px 14px' : last ? '14px 14px 14px 4px' : '8px 14px 14px 8px'),
              fontSize: 13.5, lineHeight: 1.65, color: '#e2e8f0', wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CHAT
═══════════════════════════════════════════════════════════════ */
export default function Chat() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const token    = localStorage.getItem('token')

  const [rooms, setRooms]             = useState([])
  const [activeRoom, setActiveRoom]   = useState(null)
  const [messages, setMessages]       = useState([])
  const [inputText, setInputText]     = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [connected, setConnected]     = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [showBanner, setShowBanner]       = useState(false)
  const [bannerElapsed, setBannerElapsed] = useState(0)
  const bannerTimerRef  = useRef(null)
  const coldShownRef    = useRef(false)
  const stompClientRef  = useRef(null)
  const subscriptionRef = useRef(null)
  const messagesEndRef  = useRef(null)
  const typingTimeouts  = useRef({})

  // Auth guard
  useEffect(() => { if (!token) navigate('/login') }, [token, navigate])

  // Cold-start banner — show if no WS in 5s
  useEffect(() => {
    const t = setTimeout(() => {
      if (!connected && !coldShownRef.current) {
        coldShownRef.current = true
        setShowBanner(true)
        bannerTimerRef.current = setInterval(() => setBannerElapsed(e => e + 1), 1000)
      }
    }, 5000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  useEffect(() => {
    if (connected && bannerTimerRef.current) {
      clearInterval(bannerTimerRef.current)
      setShowBanner(false)
      setBannerElapsed(0)
    }
  }, [connected])

  // Load rooms
  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setRooms(data); if (data.length > 0) setActiveRoom(data[0]) })
      .catch(console.error)
  }, [token])

  // WebSocket connect
  useEffect(() => {
    if (!token) return
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect:     () => { setConnected(true); stompClientRef.current = client },
      onDisconnect:  () => setConnected(false),
      onStompError:  f  => console.error('STOMP', f),
    })
    client.activate()
    return () => client.deactivate()
  }, [token])

  // Subscribe to active room
  useEffect(() => {
    if (!connected || !activeRoom || !stompClientRef.current) return
    subscriptionRef.current?.unsubscribe()
    setMessages([])

    fetch(`${API_BASE}/api/chat/${activeRoom.id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(setMessages).catch(console.error)

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
      body: JSON.stringify({ type: 'JOIN', senderUsername: username }),
    })
    return () => subscriptionRef.current?.unsubscribe()
  }, [connected, activeRoom]) // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = useCallback(msg => {
    if (msg.senderUsername === username) return
    const u = msg.senderUsername
    setTypingUsers(prev => [...new Set([...prev, u])])
    clearTimeout(typingTimeouts.current[u])
    typingTimeouts.current[u] = setTimeout(() => {
      setTypingUsers(prev => prev.filter(x => x !== u))
    }, 2500)
  }, [username])

  const sendTypingEvent = useCallback(() => {
    if (!stompClientRef.current || !activeRoom) return
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({ type: 'TYPING', senderUsername: username }),
    })
  }, [activeRoom, username])

  const sendMessage = useCallback(() => {
    const text = inputText.trim()
    if (!text || !stompClientRef.current || !activeRoom) return
    stompClientRef.current.publish({
      destination: `/app/chat/${activeRoom.id}`,
      body: JSON.stringify({ content: text, type: 'CHAT', senderUsername: username, roomId: String(activeRoom.id) }),
    })
    setInputText('')
  }, [inputText, activeRoom, username])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const createRoom = async () => {
    const name = newRoomName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name) return
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      const room = await res.json()
      setRooms(prev => [...prev, room])
      setActiveRoom(room)
      setNewRoomName('')
      setShowModal(false)
    } catch (e) { console.error(e) }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  // Group consecutive messages from same sender
  const messageGroups = []
  messages.forEach(msg => {
    if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
      messageGroups.push({ type: 'system', msg })
      return
    }
    const last = messageGroups[messageGroups.length - 1]
    if (last && last.type === 'group' && last.sender === msg.senderUsername) {
      last.msgs.push(msg)
    } else {
      messageGroups.push({ type: 'group', sender: msg.senderUsername, msgs: [msg] })
    }
  })

  const canSend = !!activeRoom && connected && !!inputText.trim()

  return (
    <>
      <div style={s.shell}>

        {/* ── SIDEBAR ── */}
        <div style={{ ...s.sidebar, marginLeft: sidebarOpen ? 0 : -258, transition: 'margin-left 0.25s ease' }}>
          <div style={s.sTop}>
            <div style={s.brand}>
              <div style={s.brandIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={s.brandName}>EnveChat</span>
            </div>
            <div style={s.userChip}>
              <Avatar name={username} size={28} radius={7} />
              <div>
                <div style={s.userChipName}>{displayName(username)}</div>
                <div style={s.userChipStatus}>
                  <span style={s.userStatusDot} />
                  Online
                </div>
              </div>
            </div>
          </div>

          <div style={s.secLabel}>Channels</div>

          <div style={s.roomsList}>
            {rooms.length === 0 && <div style={s.noRooms}>No channels yet</div>}
            {rooms.map(room => {
              const active = activeRoom?.id === room.id
              return (
                <div key={room.id} style={{ ...s.roomItem, ...(active ? s.roomActive : {}) }}
                  onClick={() => setActiveRoom(room)}>
                  <span style={{ ...s.roomHash, color: active ? '#60a5fa' : '#334155' }}>#</span>
                  <span style={{ ...s.roomName, color: active ? '#f1f5f9' : '#64748b' }}>{room.name}</span>
                  {active && <span style={s.activePip} />}
                </div>
              )
            })}
          </div>

          <button style={s.newRoomBtn} onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Channel
          </button>

          <div style={s.sFooter}>
            <div style={s.connRow}>
              <span style={{
                ...s.dot,
                background: connected ? '#22c55e' : '#ef4444',
                boxShadow: connected ? '0 0 8px #22c55e88' : 'none',
              }} />
              <span style={s.connLabel}>{connected ? 'Connected' : 'Connecting…'}</span>
            </div>
            <button style={s.logoutBtn} onClick={logout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={s.main}>

          {showBanner && <ColdStartBanner elapsed={bannerElapsed} onDismiss={() => setShowBanner(false)} />}

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerL}>
              <button style={s.menuBtn} onClick={() => setSidebarOpen(o => !o)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              {activeRoom
                ? <><span style={s.headerHash}>#</span><span style={s.headerRoom}>{activeRoom.name}</span></>
                : <span style={s.headerRoom}>Select a channel</span>
              }
            </div>
            <div style={s.headerR}>
              {connected && (
                <div style={s.onlinePill}>
                  <span style={s.onlineDot} />Online
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={s.msgs}>
            {!activeRoom && (
              <div style={s.emptyState}>
                <div style={s.emptyIconWrap}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={s.emptyTitle}>No channel selected</div>
                <div style={s.emptySub}>Pick a channel or create a new one</div>
              </div>
            )}

            {activeRoom && messageGroups.length === 0 && (
              <div style={s.intro}>
                <div style={s.introHash}>#</div>
                <div style={s.introTitle}>Welcome to #{activeRoom.name}</div>
                <div style={s.introSub}>This is the very beginning of <strong>#{activeRoom.name}</strong>. Say hello! 👋</div>
              </div>
            )}

            {messageGroups.map((group, i) => {
              if (group.type === 'system') {
                const { msg } = group
                return (
                  <div key={i} style={s.sysMsg}>
                    <div style={s.sysMsgLine} />
                    <span>{msg.type === 'JOIN' ? `${displayName(msg.senderUsername)} joined` : `${displayName(msg.senderUsername)} left`}</span>
                    <div style={s.sysMsgLine} />
                  </div>
                )
              }
              return <MessageGroup key={i} msgs={group.msgs} own={group.sender === username} />
            })}

            {typingUsers.length > 0 && (
              <div style={s.typingRow}>
                <div style={s.typingBubble}>
                  {[0,1,2].map(i => <span key={i} style={{ ...s.typingDot, animationDelay:`${i*0.18}s` }} />)}
                </div>
                <span style={s.typingTxt}>
                  {typingUsers.map(displayName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            <div style={{ ...s.inputBox, ...((!activeRoom || !connected) ? {opacity:0.5} : {}) }}>
              <textarea
                style={s.ta}
                value={inputText}
                onChange={e => { setInputText(e.target.value); sendTypingEvent() }}
                onKeyDown={handleKeyDown}
                placeholder={activeRoom ? `Message #${activeRoom.name}…` : 'Select a channel first'}
                disabled={!activeRoom || !connected}
                rows={1}
              />
              <button
                style={{ ...s.sendBtn, ...(canSend ? s.sendActive : {}) }}
                onClick={sendMessage}
                disabled={!canSend}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={s.hint}>↵ Enter to send · Shift+↵ for new line</div>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTop}>
              <span style={s.modalTitle}>New Channel</span>
              <button style={s.modalX} onClick={() => setShowModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={s.modalSub}>Lowercase names, dashes for spaces</p>
            <div style={s.modalField}>
              <span style={s.mHash}>#</span>
              <input style={s.mInput} type="text" placeholder="e.g. dev-talk"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                autoFocus />
            </div>
            <div style={s.modalBtns}>
              <button style={s.mCancel} onClick={() => { setShowModal(false); setNewRoomName('') }}>Cancel</button>
              <button style={s.mCreate} onClick={createRoom}>Create Channel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030712; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 99px; }
      `}</style>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const s = {
  shell: { display:'flex', height:'100vh', background:'#040d1a', fontFamily:"'Sora',sans-serif", overflow:'hidden' },

  sidebar: { width:258, minWidth:258, background:'#07111f', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', overflow:'hidden' },
  sTop: { padding:'18px 14px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  brand: { display:'flex', alignItems:'center', gap:9, marginBottom:16 },
  brandIcon: { width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  brandName: { fontSize:16, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.03em' },
  userChip: { display:'flex', alignItems:'center', gap:9, padding:'9px 10px', background:'rgba(255,255,255,0.04)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' },
  userChipName: { fontSize:12, fontWeight:600, color:'#cbd5e1', lineHeight:1.3 },
  userChipStatus: { display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#4ade80', marginTop:2 },
  userStatusDot: { width:5, height:5, borderRadius:'50%', background:'#22c55e' },
  secLabel: { fontSize:10, fontWeight:600, letterSpacing:'0.12em', color:'#1e3a5f', padding:'14px 14px 6px', textTransform:'uppercase' },
  roomsList: { flex:1, overflowY:'auto', padding:'4px 8px' },
  noRooms: { fontSize:12, color:'#1e3a5f', padding:'10px 6px' },
  roomItem: { display:'flex', alignItems:'center', gap:7, padding:'8px 10px', borderRadius:8, cursor:'pointer', marginBottom:2, border:'1px solid transparent', transition:'background 0.12s' },
  roomActive: { background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' },
  roomHash: { fontFamily:'monospace', fontSize:15, fontWeight:700, lineHeight:1 },
  roomName: { fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  activePip: { width:5, height:5, borderRadius:'50%', background:'#3b82f6', flexShrink:0 },
  newRoomBtn: { margin:'8px', padding:'9px 12px', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:9, background:'transparent', color:'#334155', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:7, fontFamily:"'Sora',sans-serif" },
  sFooter: { padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', gap:8 },
  connRow: { display:'flex', alignItems:'center', gap:7, padding:'4px 6px' },
  dot: { width:7, height:7, borderRadius:'50%', flexShrink:0, transition:'background 0.3s, box-shadow 0.4s' },
  connLabel: { fontSize:11, color:'#334155' },
  logoutBtn: { display:'flex', alignItems:'center', gap:7, width:'100%', padding:'9px 10px', background:'transparent', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, color:'#475569', fontSize:12, cursor:'pointer', fontFamily:"'Sora',sans-serif" },

  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },

  header: { padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(7,17,31,0.95)', backdropFilter:'blur(16px)', flexShrink:0 },
  headerL: { display:'flex', alignItems:'center', gap:12 },
  menuBtn: { background:'transparent', border:'none', color:'#334155', cursor:'pointer', padding:5, display:'flex', alignItems:'center', borderRadius:6, flexShrink:0 },
  headerHash: { fontSize:18, fontFamily:'monospace', fontWeight:700, color:'#1e3a5f', marginRight:4 },
  headerRoom: { fontSize:15, fontWeight:600, color:'#e2e8f0', letterSpacing:'-0.02em' },
  headerR: { display:'flex', alignItems:'center', gap:10 },
  onlinePill: { display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#4ade80', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)', padding:'4px 10px', borderRadius:99 },
  onlineDot: { width:5, height:5, borderRadius:'50%', background:'#22c55e' },

  msgs: { flex:1, overflowY:'auto', padding:'20px 24px 12px', display:'flex', flexDirection:'column', gap:2 },

  emptyState: { margin:'auto', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  emptyIconWrap: { width:64, height:64, borderRadius:16, background:'rgba(30,58,95,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  emptyTitle: { fontSize:16, fontWeight:600, color:'#334155' },
  emptySub: { fontSize:13, color:'#1e3a5f', maxWidth:260, lineHeight:1.6 },

  intro: { padding:'16px 0 28px', borderBottom:'1px solid rgba(255,255,255,0.04)', marginBottom:16 },
  introHash: { fontSize:52, fontWeight:800, color:'#0f2744', fontFamily:'monospace', lineHeight:1, marginBottom:8 },
  introTitle: { fontSize:22, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.02em', marginBottom:6 },
  introSub: { fontSize:13, color:'#334155', lineHeight:1.7 },

  sysMsg: { display:'flex', alignItems:'center', gap:10, padding:'10px 0', fontSize:11, color:'#1e3a5f' },
  sysMsgLine: { flex:1, height:1, background:'rgba(255,255,255,0.03)' },

  typingRow: { display:'flex', alignItems:'center', gap:10, padding:'4px 0' },
  typingBubble: { display:'flex', alignItems:'center', gap:3, padding:'6px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 },
  typingDot: { width:5, height:5, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animation:'bounce 1.2s ease-in-out infinite' },
  typingTxt: { fontSize:11.5, color:'#334155', fontStyle:'italic' },

  inputArea: { padding:'14px 20px 18px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(7,17,31,0.95)', flexShrink:0 },
  inputBox: { display:'flex', alignItems:'flex-end', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:14, padding:'4px 4px 4px 16px' },
  ta: { flex:1, background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontFamily:"'Sora',sans-serif", fontSize:13.5, resize:'none', padding:'9px 8px 9px 0', minHeight:40, maxHeight:140, lineHeight:1.65 },
  sendBtn: { width:40, height:40, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'not-allowed', color:'#1e3a5f', flexShrink:0, marginBottom:1, transition:'all 0.2s' },
  sendActive: { background:'linear-gradient(135deg,#3b82f6,#6366f1)', border:'1px solid transparent', color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(59,130,246,0.3)' },
  hint: { fontSize:10.5, color:'#1e3a5f', marginTop:7, letterSpacing:'0.02em' },

  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#07111f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px', width:360, boxShadow:'0 32px 64px rgba(0,0,0,0.7)', animation:'fadeUp 0.2s ease' },
  modalTop: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  modalTitle: { fontSize:16, fontWeight:700, color:'#f1f5f9' },
  modalX: { background:'transparent', border:'none', color:'#475569', cursor:'pointer', padding:4, display:'flex' },
  modalSub: { fontSize:12, color:'#334155', marginBottom:16 },
  modalField: { display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 14px', marginBottom:18 },
  mHash: { fontFamily:'monospace', fontSize:16, fontWeight:800, color:'#334155' },
  mInput: { flex:1, background:'transparent', border:'none', outline:'none', color:'#f1f5f9', fontFamily:"'Sora',sans-serif", fontSize:14 },
  modalBtns: { display:'flex', gap:8, justifyContent:'flex-end' },
  mCancel: { padding:'9px 18px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#64748b', fontSize:13, cursor:'pointer', fontFamily:"'Sora',sans-serif" },
  mCreate: { padding:'9px 20px', background:'linear-gradient(135deg,#3b82f6,#6366f1)', border:'none', borderRadius:8, color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600, fontFamily:"'Sora',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.3)' },
}

const ban = {
  wrap: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'10px 18px', background:'rgba(23,37,84,0.5)', borderBottom:'1px solid rgba(59,130,246,0.15)', flexShrink:0, animation:'slideDown 0.3s ease' },
  left: { display:'flex', alignItems:'center', gap:8 },
  text: { fontSize:12, color:'#93c5fd', fontFamily:"'Sora',sans-serif" },
  right: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  track: { width:90, height:4, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' },
  fill: { height:'100%', background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius:99, transition:'width 1s linear' },
  close: { background:'transparent', border:'none', color:'#334155', cursor:'pointer', fontSize:14, lineHeight:1, padding:2 },
}

