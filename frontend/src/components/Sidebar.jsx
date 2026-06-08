import { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'

const Sidebar = () => {
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { authUser, logout, onlineUsers } = useAuthStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    getUsers()
  }, [])

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          Quick<span className="text-indigo-500">Chat</span>
        </h1>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <div
          className="relative cursor-pointer"
          onClick={() => window.location.href = '/profile'}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt="profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              authUser?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></span>
        </div>
        <div className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
          <p className="text-white font-medium hover:text-indigo-400 transition">{authUser?.username}</p>
          <p className="text-green-400 text-xs">Online</p>
        </div>
        <button
          onClick={logout}
          className="ml-auto text-gray-400 hover:text-red-400 text-sm transition"
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Online count */}
      <div className="px-4 py-1">
        <p className="text-gray-400 text-xs">{onlineUsers.length} online</p>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isUsersLoading ? (
          <p className="text-gray-400 text-center mt-4">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition ${
                selectedUser?._id === user._id
                  ? 'bg-indigo-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="profile" className="w-10 h-10 object-cover" />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{user.username}</p>
                <p className="text-gray-400 text-xs truncate">
                  {user.lastMessage ? user.lastMessage : onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                </p>
              </div>
              {/* Unread count badge */}
              {user.unreadCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {user.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar