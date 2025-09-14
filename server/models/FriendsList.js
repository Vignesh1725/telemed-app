const mongoose = require('mongoose');

const friendListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "blocked"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

friendListSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model("FriendsList", friendListSchema);