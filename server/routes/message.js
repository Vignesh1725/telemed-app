const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Message = require("../models/Message");
const mongoose = require("mongoose");

router.post("/send", verifyToken, async (req, res) => {
  try {
    const { sender, senderId, recipientId, message } = req.body;
    const toObjectId = (id) =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

    const currentSenderId = toObjectId(senderId);
    const currentRecipientId = toObjectId(recipientId);

    if (!currentRecipientId || !message) {
      return res.status(400).json({ error: "Recipient and message are required" });
    }

    const newMsg = new Message({
      sender,
      senderId: currentSenderId,
      recipientId: currentRecipientId,
      message
    });
    await newMsg.save();

    res.json({ msg: "Sent" });
  } catch (err) {
    console.error("Error in /send:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getmsg/:userId", verifyToken, async (req, res) => {
  try {
    const currentUserId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    const recipientId = mongoose.Types.ObjectId.isValid(req.params.userId)
      ? new mongoose.Types.ObjectId(req.params.userId)
      : req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId },
        { senderId: recipientId, recipientId: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error in GET /:userId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router; 