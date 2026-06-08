import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://quickchat-s0wu.onrender.com/api',
  withCredentials: true,
});