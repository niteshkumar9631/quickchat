import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://quickchat-s0wu.onrender.com'

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axiosInstance.get('/auth/me');
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      set({ authUser: res.data, isSigningUp: false });
      toast.success('Account created successfully!');
      get().connectSocket();
    } catch (error) {
      set({ isSigningUp: false });
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      set({ authUser: res.data, isLoggingIn: false });
      toast.success('Logged in successfully!');
      get().connectSocket();
    } catch (error) {
      set({ isLoggingIn: false });
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      get().disconnectSocket();
      set({ authUser: null });
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: { userId: authUser._id }
    });

    socket.connect();
    set({ socket });

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({ socket: null });
  },

updateProfile: async (data) => {
  try {
    const res = await axiosInstance.put('/auth/update-profile', data)
    set({ authUser: res.data })
    toast.success('Profile updated successfully!')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Something went wrong')
  }
},

}));