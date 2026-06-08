# QuickChat 💬

A real-time chat application built with the MERN stack and Socket.io, featuring a Discord-inspired dark theme.

🔗 **Live Demo:** [quickchat-five-iota.vercel.app](https://quickchat-five-iota.vercel.app)

---

## ✨ Features

- 🔐 JWT Authentication (Register / Login / Logout)
- 💬 Real-time Messaging with Socket.io
- 🖼️ Image Sharing in Chat
- ↩️ Message Reply with Preview
- 🗑️ Delete Messages (both sides)
- ⌨️ Typing Indicator (live)
- 😊 Emoji Picker
- 🟢 Online / Offline Status
- 🕐 Last Seen Time
- 🔔 Unread Message Count
- 🔍 User Search
- 👤 Profile Edit (username + photo)
- 📋 Last Message Preview in Sidebar
- 🌙 Discord-style Dark Theme

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS v4
- Zustand (State Management)
- Socket.io Client
- Axios
- React Router DOM
- React Hot Toast
- Emoji Picker React
- Lucide React

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Bcrypt.js

**Deployment:**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB Atlas account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/niteshkumar9631/quickchat.git
cd quickchat
```

**2. Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📸 Screenshots

> Discord-style dark theme with real-time messaging

---

## 👨‍💻 Author

**Nitesh Kumar Gond**
- GitHub: [@niteshkumar9631](https://github.com/niteshkumar9631)
- LinkedIn: [nitesh-kumar-gond](https://linkedin.com/in/nitesh-kumar-gond)
