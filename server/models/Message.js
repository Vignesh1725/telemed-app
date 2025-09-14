const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // sender's email
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
