import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  replyTo: null,

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/messages/users')
      set({ users: res.data, isUsersLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
      set({ isUsersLoading: false })
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/messages/${userId}`)
      set({ messages: res.data, isMessagesLoading: false })
      await axiosInstance.put(`/messages/seen/${userId}`)
      set((state) => ({
        users: state.users.map((u) =>
          u._id === userId ? { ...u, unreadCount: 0 } : u
        )
      }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (receiverId, message, image = '') => {
    try {
      const { replyTo } = get()
      const res = await axiosInstance.post(`/messages/send/${receiverId}`, {
        message,
        image,
        replyTo: replyTo?._id || null,
        replyMessage: replyTo?.image && !replyTo?.message ? '📷 Image' : replyTo?.message || ''
      })
      set((state) => ({ messages: [...state.messages, res.data] }))
      set({ replyTo: null })
      set((state) => {
        const receiverUser = state.users.find((u) => u._id === receiverId)
        const otherUsers = state.users.filter((u) => u._id !== receiverId)
        return { users: receiverUser ? [receiverUser, ...otherUsers] : state.users }
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`)
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId)
      }))
      toast.success('Message deleted!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  },

  setReplyTo: (msg) => set({ replyTo: msg }),
  clearReplyTo: () => set({ replyTo: null }),

  subscribeToMessages: () => {
    const { selectedUser } = get()
    if (!selectedUser) return

    const socket = useAuthStore.getState().socket
    if (!socket) return

    socket.on('typing', () => {
      set({ isTyping: true })
    })

    socket.on('stopTyping', () => {
      set({ isTyping: false })
    })

    socket.on('newMessage', (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return
      set((state) => ({ messages: [...state.messages, newMessage] }))
      axiosInstance.put(`/messages/seen/${newMessage.senderId}`)
    })

    socket.on('newUnreadMessage', (data) => {
      set((state) => {
        const updatedUsers = state.users.map((u) =>
          u._id === data.senderId
            ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
            : u
        )
        const senderUser = updatedUsers.find((u) => u._id === data.senderId)
        const otherUsers = updatedUsers.filter((u) => u._id !== data.senderId)
        return { users: senderUser ? [senderUser, ...otherUsers] : updatedUsers }
      })
    })

    socket.on('messageDeleted', (messageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId)
      }))
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return
    socket.off('newMessage')
    socket.off('newUnreadMessage')
    socket.off('messageDeleted')
    socket.off('typing')
    socket.off('stopTyping')
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}))