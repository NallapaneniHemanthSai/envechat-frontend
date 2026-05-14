import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

import { API_BASE } from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useChatRooms from '../../hooks/useChatRooms'
import { getRoomHistory } from '../../services/api'
import { chatStore } from '../../store/chatStore'

import ChatComposer from './ChatComposer'
import ChatHeader from './ChatHeader'
import ChatMessageList from './ChatMessageList'
import ChatSidebar from './ChatSidebar'
import ServerSidebar from './ServerSidebar'
import MemberSidebar from './MemberSidebar'
import CommandPalette from './CommandPalette'

import {
  CreateRoomModal,
  LeaveRoomModal,
  ProfileModal,
  RoomSettingsModal,
  SearchModal,
} from './ChatModals'

import {
  ColdStartBanner,
  ReconnectBanner,
} from './ChatPrimitives'

export default function ChatPage() {
  const navigate = useNavigate()

  const { token, username, avatarUrl, setAvatar, logout } = useAuth()
  const { toast } = useToast()

  const {
    rooms,
    setRooms,
    loading: roomsLoading,
    createRoom,
  } = useChatRooms(token)

  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [connected, setConnected] = useState(false)
  const [wsPhase, setWsPhase] = useState('idle')
  const [clientKey, setClientKey] = useState(0)
  const [typingUsers, setTypingUsers] = useState([])
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [showColdBanner, setShowColdBanner] = useState(false)
  const [coldElapsed, setColdElapsed] = useState(0)
  const [replyTo, setReplyTo] = useState(null)
  const [sending, setSending] = useState(false)

  const [modalCreate, setModalCreate] = useState(false)
  const [modalProfile, setModalProfile] = useState(false)
  const [modalSearch, setModalSearch] = useState(false)
  const [modalRoom, setModalRoom] = useState(false)
  const [modalLeave, setModalLeave] = useState(false)

  const [newRoomName, setNewRoomName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(true)

  const stompRef = useRef(null)
  const subRef = useRef(null)

  const typingTimeouts = useRef({})
  const coldShownRef = useRef(false)
  const bannerTimerRef = useRef(null)
  const historyRequestRef = useRef(0)

  const activeRoom = useMemo(() => {
    if (!rooms.length) return null

    if (selectedRoomId != null) {
      const found = rooms.find(
        (r) => String(r.id) === String(selectedRoomId),
      )

      if (found) return found
    }

    return rooms[0]
  }, [rooms, selectedRoomId])

  const activeRoomId = activeRoom?.id

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!connected && !coldShownRef.current) {
        coldShownRef.current = true

        setShowColdBanner(true)

        bannerTimerRef.current = setInterval(() => {
          setColdElapsed((e) => e + 1)
        }, 1000)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [connected])

  useEffect(() => {
    if (connected && bannerTimerRef.current) {
      clearInterval(bannerTimerRef.current)
      bannerTimerRef.current = null
      setShowColdBanner(false)
      setColdElapsed(0)
    }
  }, [connected])

  useEffect(() => {
    const timeouts = typingTimeouts.current

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current)
      Object.values(timeouts).forEach(clearTimeout)
    }
  }, [])

  const handleTyping = useCallback(
    (msg) => {
      if (msg.senderUsername === username) return

      const user = msg.senderUsername

      setTypingUsers((prev) => [...new Set([...prev, user])])

      clearTimeout(typingTimeouts.current[user])

      typingTimeouts.current[user] = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((x) => x !== user),
        )
      }, 2500)
    },
    [username],
  )

  const sendTypingEvent = useCallback(() => {
    if (!stompRef.current) return
    if (!connected) return
    if (!activeRoom) return

    try {
      stompRef.current.publish({
        destination: `/app/chat/${activeRoom.id}`,
        body: JSON.stringify({
          type: 'TYPING',
          senderUsername: username,
        }),
      })
    } catch (err) {
      console.error(err)
    }
  }, [connected, activeRoom, username])

  useEffect(() => {
    if (!token) return

    let mounted = true
    setWsPhase('connecting')
    chatStore.setConnection({ connected: false, phase: 'connecting' })

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${API_BASE}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: () => {},

      onConnect: () => {
        if (!mounted) return
        console.log('Connected')

        stompRef.current = client

        setConnected(true)
        setWsPhase('connected')
        chatStore.setConnection({ connected: true, phase: 'connected' })
      },

      onDisconnect: () => {
        if (!mounted) return
        console.log('Disconnected')

        setConnected(false)
        setWsPhase('disconnected')
        chatStore.setConnection({ connected: false, phase: 'disconnected' })

        stompRef.current = null
      },

      onStompError: (frame) => {
        if (!mounted) return
        console.error(frame)

        setConnected(false)
        setWsPhase('error')
        chatStore.setConnection({ connected: false, phase: 'error' })

        toast('Realtime connection error', 'danger')
      },

      onWebSocketError: (err) => {
        if (!mounted) return
        console.error(err)

        setConnected(false)
        setWsPhase('error')
        chatStore.setConnection({ connected: false, phase: 'error' })
      },
    })

    client.activate()

    return () => {
      mounted = false
      if (subRef.current) {
        subRef.current.unsubscribe()
        subRef.current = null
      }

      if (client.active) {
        client.deactivate()
      }

      stompRef.current = null

      setConnected(false)
      setWsPhase('idle')
      chatStore.setConnection({ connected: false, phase: 'idle' })
    }
  }, [token, clientKey, toast])

  useEffect(() => {
    if (!connected) return
    if (!activeRoomId) return
    if (!stompRef.current) return

    const client = stompRef.current

    if (subRef.current) {
      subRef.current.unsubscribe()
      subRef.current = null
    }

    setMessages([])
    setTypingUsers([])

    const loadHistory = async () => {
      const requestId = historyRequestRef.current + 1
      historyRequestRef.current = requestId

      try {
        const { data } = await getRoomHistory(activeRoomId)

        if (historyRequestRef.current !== requestId) return
        setMessages(data)
        chatStore.setRoomMessages(activeRoomId, data)
      } catch (err) {
        if (historyRequestRef.current !== requestId) return
        console.error(err)

        toast(
          'Could not load message history',
          'danger',
        )

        setMessages([])
      }
    }

    loadHistory()

    const subscription = client.subscribe(
      `/topic/room/${activeRoomId}`,
      (frame) => {
        try {
          const msg = JSON.parse(frame.body)

          if (msg.type === 'TYPING') {
            handleTyping(msg)
            return
          }

          setMessages((prev) => {
            const optimisticIndex = prev.findIndex(
              (m) =>
                m._optimistic &&
                m.content === msg.content
            )

            if (optimisticIndex !== -1) {
              const updated = [...prev]
              const optMsg = updated[optimisticIndex]

              updated[optimisticIndex] = {
                ...optMsg,
                ...msg,
                senderUsername: optMsg.senderUsername,
                _optimistic: false,
              }

              chatStore.setRoomMessages(activeRoomId, updated)
              return updated
            }

            const exists = prev.some(
              (m) =>
                m.id &&
                msg.id &&
                String(m.id) === String(msg.id),
            )

            if (exists) return prev

            const fingerprint = `${msg.senderUsername || ''}|${msg.sentAt || ''}|${msg.content || ''}|${msg.type || ''}`
            const seenFingerprint = prev.some((m) => {
              const candidate = `${m.senderUsername || ''}|${m.sentAt || ''}|${m.content || ''}|${m.type || ''}`
              return candidate === fingerprint
            })

            if (seenFingerprint) return prev

            const incomingMsg = {
              ...msg,
              id: msg.id || Date.now() + Math.random(),
              sentAt: msg.sentAt || new Date().toISOString(),
            }

            const next = [...prev, incomingMsg]
            chatStore.setRoomMessages(activeRoomId, next)
            return next
          })
        } catch (err) {
          console.error(err)
        }
      },
    )

    subRef.current = subscription

    client.publish({
      destination: `/app/chat/${activeRoomId}/join`,
      body: JSON.stringify({
        type: 'JOIN',
        senderUsername: username,
      }),
    })

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe()
        subRef.current = null
      }
    }
  }, [
    connected,
    activeRoomId,
    token,
    username,
    toast,
    handleTyping,
  ])

  const reconnectNow = useCallback(() => {
    setClientKey((k) => k + 1)
    toast('Reconnecting…', 'default')
  }, [toast])

  const sendMessage = useCallback(() => {
    const text = inputText.trim()

    if (!text) return
    if (!connected) return
    if (!activeRoom) return
    if (!stompRef.current) return

    const optimisticId = Date.now()

    const optimisticMessage = {
      id: optimisticId,
      content: text,
      type: 'CHAT',
      senderUsername: username,
      sentAt: new Date().toISOString(),
      roomId: String(activeRoom.id),
      _optimistic: true,
    }

    setMessages((prev) => [
      ...prev,
      optimisticMessage,
    ])

    setInputText('')
    setReplyTo(null)
    setSending(true)

    try {
      stompRef.current.publish({
        destination: `/app/chat/${activeRoom.id}`,

        body: JSON.stringify({
          content: text,
          type: 'CHAT',
          senderUsername: username,
          roomId: String(activeRoom.id),
          replyToId: replyTo?.id || null,
        }),
      })

      setTimeout(() => {
        setSending(false)
      }, 300)
    } catch (err) {
      console.error(err)

      setSending(false)

      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticId),
      )

      toast('Failed to send message', 'danger')
    }
  }, [
    inputText,
    connected,
    activeRoom,
    username,
    replyTo,
    toast,
  ])

  const onToggleReaction = useCallback(() => {
    toast('Message reactions need backend support first', 'default')
  }, [toast])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    if (!q) return []

    return messages
      .filter(
        (m) =>
          m.type === 'CHAT' &&
          m.content?.toLowerCase().includes(q),
      )
      .slice(0, 40)
  }, [messages, searchQuery])

  const memberCount = useMemo(() => {
    const ids = new Set(
      messages
        .filter(
          (m) =>
            m.type === 'CHAT' &&
            m.senderUsername,
        )
        .map((m) => m.senderUsername),
    )

    if (username) ids.add(username)

    return ids.size || null
  }, [messages, username])

  const memberUsers = useMemo(() => {
    const ids = new Set(
      messages
        .filter((m) => m.type === 'CHAT' && m.senderUsername)
        .map((m) => m.senderUsername),
    )

    if (username) ids.add(username)

    return [...ids].map((memberUsername) => ({
      username: memberUsername,
      status: memberUsername === username && connected ? 'online' : 'unknown',
    }))
  }, [messages, username, connected])

  const paletteActions = useMemo(
    () => [
      {
        id: 'search',
        label: 'Search messages',
        hint: 'Modal',
        run: () => setModalSearch(true),
      },
      {
        id: 'profile',
        label: 'Profile',
        run: () => setModalProfile(true),
      },
      {
        id: 'new',
        label: 'Create channel',
        run: () => setModalCreate(true),
      },
      {
        id: 'scroll',
        label: 'Jump to latest',
        hint: 'Chat',
        run: () =>
          window.dispatchEvent(
            new CustomEvent('envechat:scroll-bottom'),
          ),
      },
      {
        id: 'reconnect',
        label: 'Reconnect realtime',
        run: reconnectNow,
      },
    ],
    [reconnectNow],
  )

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((o) => !o)
      }

      if (e.key === 'Escape') {
        setCommandOpen(false)
        setModalCreate(false)
        setModalProfile(false)
        setModalSearch(false)
        setModalRoom(false)
        setModalLeave(false)
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const confirmCreate = async () => {
    const res = await createRoom(newRoomName)

    if (res.ok) {
      setSelectedRoomId(res.room.id)
      setNewRoomName('')
      setModalCreate(false)

      toast('Channel created', 'success')
    } else {
      toast(res.error || 'Failed', 'danger')
    }
  }

  const leaveLocal = () => {
    const id = activeRoom?.id

    setModalLeave(false)
    setModalRoom(false)

    setRooms((prev) => {
      const next = prev.filter((r) => r.id !== id)

      const first = next[0] ?? null

      queueMicrotask(() =>
        setSelectedRoomId(first ? first.id : null),
      )

      return next
    })

    toast('Removed channel locally', 'default')
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#1e1f22] font-sans text-slate-200">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ServerSidebar />

        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={(room) =>
            setSelectedRoomId(room.id)
          }
          username={username}
          avatarUrl={avatarUrl}
          connected={connected}
          wsPhase={wsPhase}
          onLogout={handleLogout}
          onNewChannel={() => setModalCreate(true)}
          onOpenProfile={() => setModalProfile(true)}
          onOpenSearch={() => setModalSearch(true)}
          mobileOpen={mobileSidebar}
          onCloseMobile={() =>
            setMobileSidebar(false)
          }
          memberCount={memberCount}
        />

        <section className="relative flex min-w-0 flex-1 flex-col border-l border-white/[0.04] bg-[#313338] md:border-l-0">
          {showColdBanner && (
            <ColdStartBanner
              elapsed={coldElapsed}
              onDismiss={() =>
                setShowColdBanner(false)
              }
            />
          )}

          <ReconnectBanner
            visible={
              !connected &&
              (
                wsPhase === 'disconnected' ||
                wsPhase === 'error'
              )
            }
            phase={wsPhase}
            onRetry={reconnectNow}
          />

          <ChatHeader
            activeRoom={activeRoom}
            connected={connected}
            onMenu={() => setCommandOpen(true)}
            onOpenRoomSettings={() =>
              setModalRoom(true)
            }
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
            mobileNav={
              <button
                type="button"
                className="inline-flex rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 md:hidden"
                onClick={() =>
                  setMobileSidebar(true)
                }
                aria-label="Open channels"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            }
          />

          <ChatMessageList
            messages={messages}
            username={username}
            currentUserAvatarUrl={avatarUrl}
            typingUsers={typingUsers}
            reactions={{}}
            onToggleReaction={onToggleReaction}
            onReply={setReplyTo}
            welcomeRoomName={activeRoom?.name}
            hasRoom={!!activeRoom}
          />

          <ChatComposer
            value={inputText}
            onChange={(v) => {
              setInputText(v)
              sendTypingEvent()
            }}
            onSend={sendMessage}
            disabled={!activeRoom || !connected}
            sending={sending}
            roomName={activeRoom?.name}
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
          />
        </section>

        {showMembers && (
          <MemberSidebar 
            currentUsername={username}
            users={memberUsers}
          />
        )}
      </div>

      <CreateRoomModal
        open={modalCreate}
        name={newRoomName}
        onChangeName={setNewRoomName}
        onCreate={confirmCreate}
        onClose={() => {
          setModalCreate(false)
          setNewRoomName('')
        }}
      />

      <ProfileModal
        open={modalProfile}
        username={username}
        avatarUrl={avatarUrl}
        onSetAvatar={setAvatar}
        onClose={() => setModalProfile(false)}
      />

      <SearchModal
        open={modalSearch}
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        results={searchResults}
        onClose={() => {
          setModalSearch(false)
          setSearchQuery('')
        }}
      />

      <RoomSettingsModal
        open={modalRoom}
        roomName={activeRoom?.name || ''}
        onClose={() => setModalRoom(false)}
        onLeave={() => {
          setModalRoom(false)
          setModalLeave(true)
        }}
      />

      <LeaveRoomModal
        open={modalLeave}
        roomName={activeRoom?.name || ''}
        onClose={() => setModalLeave(false)}
        onConfirm={leaveLocal}
      />

      {commandOpen && (
        <CommandPalette
          onClose={() => setCommandOpen(false)}
          actions={paletteActions}
        />
      )}

      {roomsLoading && (
        <div className="pointer-events-none fixed bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-slate-400 backdrop-blur">
          Syncing channels…
        </div>
      )}
    </div>
  )
}
