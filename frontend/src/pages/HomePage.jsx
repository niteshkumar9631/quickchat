import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useChatStore } from '../store/useChatStore'

const HomePage = () => {
  const { selectedUser } = useChatStore()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />

      {/* Chat Area */}
      {selectedUser ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg">Select a user to start chatting</p>
            <p className="text-gray-600 text-sm mt-2">Choose from the sidebar</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage