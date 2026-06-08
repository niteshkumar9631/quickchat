const Message = require('../models/Message');
const User = require('../models/User');
const { io, getReceiverSocketId } = require('../socket');

// Get all users for sidebar
const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const users = await User.find({ 
      _id: { $ne: loggedInUserId } 
    }).select('-password')

    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          seen: false
        })

        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId }
          ]
        }).sort({ createdAt: -1 })

        return { 
          ...user.toObject(), 
          unreadCount,
          lastMessage: lastMessage?.image && !lastMessage?.message ? '📷 Image' : lastMessage?.message || '',
          lastMessageTime: lastMessage?.createdAt || null,
          lastSeen: user.lastSeen || null
        }
      })
    )

    usersWithUnread.sort((a, b) => {
      if (!a.lastMessageTime) return 1
      if (!b.lastMessageTime) return -1
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    })

    res.status(200).json(usersWithUnread)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get messages
const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { message, image, replyTo, replyMessage } = req.body
    const { id: receiverId } = req.params
    const senderId = req.user._id

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: message || '',
      image: image || '',
      replyTo: replyTo || null,
      replyMessage: replyMessage || ''
    })

    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
      io.to(receiverSocketId).emit('newUnreadMessage', {
        senderId: senderId.toString()
      })
    }

    res.status(201).json(newMessage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params
    const message = await Message.findById(id)

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    if (
      message.senderId.toString() !== req.user._id.toString() &&
      message.receiverId.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Message.findByIdAndDelete(id)

    const receiverSocketId = getReceiverSocketId(message.receiverId)
    const senderSocketId = getReceiverSocketId(message.senderId)

    if (receiverSocketId) io.to(receiverSocketId).emit('messageDeleted', id)
    if (senderSocketId) io.to(senderSocketId).emit('messageDeleted', id)

    res.status(200).json({ message: 'Message deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mark messages as seen
const markAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params
    const receiverId = req.user._id

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { seen: true }
    )

    res.status(200).json({ message: 'Messages marked as seen' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getUsersForSidebar, getMessages, sendMessage, deleteMessage, markAsSeen }