import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const { signup, isSigningUp } = useAuthStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    signup(formData)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Quick<span className="text-indigo-500">Chat</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Username</label>
            <input
              type="text"
              className="w-full bg-gray-700 text-white rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              className="w-full bg-gray-700 text-white rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              className="w-full bg-gray-700 text-white rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {isSigningUp ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage