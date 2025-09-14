const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { verifyToken } = require('../middleware/auth');

router.get("/doclist", verifyToken, async (req, res) => {
    try {
        const doctorsList = await Doctor.find();
        res.status(200).json(doctorsList);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
})

module.exports = router;