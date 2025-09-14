const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.get("/records", verifyToken, (req, res) => {
    res.json({
        patientId: req.user.id,
        allergies: ["Penicillin", "Dust"],
        medications: ["Metformin", "Atorvastatin"],
        history: "Type 2 Diabetes, High BP"
    });
});

module.exports = router;