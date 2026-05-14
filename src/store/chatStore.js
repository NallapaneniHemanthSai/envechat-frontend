import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  messagesByRoom: {},
  connection: {
    connected: false,
    phase: 'idle',
  },

  setConnection: (connection) => {
    set((state) => ({
      connection: {
        ...state.connection,
        ...connection,
      },
    }))
  },

  setRoomMessages: (roomId, messages) => {
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [String(roomId)]: messages,
      },
    }))
  },

  getRoomMessages: (roomId) => get().messagesByRoom[String(roomId)] || [],
}))

export const chatStore = {
  getState: useChatStore.getState,
  setConnection: (...args) => useChatStore.getState().setConnection(...args),
  setRoomMessages: (...args) => useChatStore.getState().setRoomMessages(...args),
}
