import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { Trash2, Image, X, Reply } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

const ChatWindow = () => {
  const { selectedUser, messages, getMessages, sendMessage, deleteMessage, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, isTyping, replyTo, setReplyTo, clearReplyTo } = useChatStore()
  const { authUser, onlineUsers } = useAuthStore()
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
      subscribeToMessages()
    }
    return () => unsubscribeFromMessages()
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if (!text.trim() && !imagePreview) return
    const socket = useAuthStore.getState().socket
    if (socket) socket.emit('stopTyping', { receiverId: selectedUser._id })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    await sendMessage(selectedUser._id, text, imagePreview)
    setText('')
    setImagePreview(null)
    setShowEmojiPicker(false)
  }

  const formatLastSeen = (date) => {
    if (!date) return 'Offline'
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return `Last seen today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return `Last seen ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold overflow-hidden">
          {selectedUser.profilePic ? (
            <img src={selectedUser.profilePic} alt="profile" className="w-10 h-10 object-cover" />
          ) : (
            selectedUser.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-white font-medium">{selectedUser.username}</p>
          {isTyping ? (
            <p className="text-green-400 text-xs">typing...</p>
          ) : onlineUsers.includes(selectedUser._id) ? (
            <p className="text-green-400 text-xs">Online</p>
          ) : (
            <p className="text-gray-400 text-xs">{formatLastSeen(selectedUser.lastSeen)}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isMessagesLoading ? (
          <p className="text-gray-400 text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">No messages yet — say hi! 👋</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-end gap-2 group ${
                msg.senderId === authUser._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 mb-2">
                <button onClick={() => setReplyTo(msg)} className="text-gray-500 hover:text-indigo-400">
                  <Reply size={14} />
                </button>
                <button onClick={() => deleteMessage(msg._id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>

              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === authUser._id
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                {msg.replyMessage && (
                  <div className="bg-black bg-opacity-20 rounded-lg px-3 py-1 mb-2 border-l-2 border-indigo-300">
                    <p className="text-xs opacity-70 truncate">{msg.replyMessage}</p>
                  </div>
                )}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="sent"
                    className="rounded-lg mb-2 max-w-full cursor-pointer"
                    onClick={() => window.open(msg.image, '_blank')}
                  />
                )}
                {msg.message && <p>{msg.message}</p>}
                <p className="text-xs opacity-60 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 border-t border-gray-700 flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-lg px-3 py-1 border-l-2 border-indigo-500">
            <p className="text-xs text-indigo-400">Replying to</p>
            <p className="text-xs text-gray-300 truncate">
              {replyTo.image && !replyTo.message ? '📷 Image' : replyTo.message}
            </p>
          </div>
          <button onClick={clearReplyTo} className="text-gray-400 hover:text-red-400">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pb-2 relative w-fit">
          <img src={imagePreview} alt="preview" className="h-20 rounded-lg" />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-0 right-0 bg-red-500 rounded-full p-0.5"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3 items-center relative">
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-400 hover:text-indigo-400 transition"
        >
          <Image size={20} />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-xl hover:scale-110 transition"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) => {
                  setText((prev) => prev + emojiData.emoji)
                  setShowEmojiPicker(false)
                }}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const socket = useAuthStore.getState().socket
            if (!socket) return
            socket.emit('typing', { receiverId: selectedUser._id })
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              socket.emit('stopTyping', { receiverId: selectedUser._id })
            }, 1500)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSend()
          }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() && !imagePreview}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow