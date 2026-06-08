const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const messageRoutes = require('./src/routes/message.routes');
const { app, server } = require('./src/socket');

connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quickchat-five-iota.vercel.app'
  ],
  credentials: true
}));
app.use(require('express').json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('QuickChat Server Running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});