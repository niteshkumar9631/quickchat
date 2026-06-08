import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState(authUser?.username || '')
  const [preview, setPreview] = useState(authUser?.profilePic || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await updateProfile({ username, profilePic: preview })
    setIsLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Edit Profile
        </h1>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden mb-3">
            {preview ? (
              <img src={preview} alt="profile" className="w-24 h-24 object-cover" />
            ) : (
              authUser?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Email — readonly */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            value={authUser?.email}
            disabled
            className="w-full bg-gray-600 text-gray-400 rounded-lg p-3 mt-1 outline-none cursor-not-allowed"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage