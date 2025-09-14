const express = require('express');
const router = express.Router();
const FriendsList = require('../models/FriendsList');
const { verifyToken } = require('../middleware/auth');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');

const toObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

//Create new friend
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { userId, friendId, status } = req.body;

        const currentUserId = toObjectId(userId);
        const currentFriendId = toObjectId(friendId);

        const exists = await FriendsList.findOne({ userId: currentUserId, friendId: currentFriendId });

        if (exists) {
            return res.status(400).json({ msg: "Already in your friend list." });
        }

        const newFriend = new FriendsList({
            userId: currentUserId,
            friendId: currentFriendId,
            status
        })

        await newFriend.save();
        res.json({ msg: "Friend added successfully" });
    } catch (err) {
        console.error("Friend List Creation Failed: ", err.messgae);
        res.status(500).json({ msg: err.message });
    }
})

//Get the friend list
router.get('/my', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const currentUserId = toObjectId(userId);

        const friendDocs = await FriendsList.find({
            userId: currentUserId,
            status: "accepted"
        }).populate('friendId');

        const friendList = friendDocs.map(doc => ({
            _id: doc.friendId._id,
            firstName: doc.friendId.firstName,
            lastName: doc.friendId.lastName,
            specialization: doc.friendId.specialization,
            status: doc.status
        }));
        res.json(friendList);
    } catch (err) {
        console.error("Friend Listing is Failed: ", err.message);
        res.status(500).json({ msg: err.message });
    }
})

router.get('/mypatients', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const currentUserId = toObjectId(userId);

        const friendDocs = await FriendsList.find({
            friendId: currentUserId,
            status: "accepted"
        });

        const patientIds = friendDocs.map(doc => doc.userId);

        const patients = await Patient.find({ _id: { $in: patientIds } }).select('firstName lastName role');
        res.json(patients);
    } catch (err) {
        console.log("Error in Patients List fetch: ", err.message);
        res.status(500).json({ msg: err.message });
    }
})

module.exports = router;