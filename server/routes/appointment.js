const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const { default: mongoose } = require('mongoose');

const toObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
}

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { doctorId, startTime, endTime, comType, notes, action } = req.body;
    Id = toObjectId(doctorId);
    const doctor = await Doctor.findById(Id).select('firstName lastName');
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    console.log("Doctor found:", doctor);
    const newApp = new Appointment({
      userId: req.user.id,
      doctor: { id: Id, firstName: doctor.firstName, lastName: doctor.lastName },
      startTime,
      endTime,
      comType,
      notes,
      action
    });
    await newApp.save();
    res.status(201).json({ msg: "Appointment created" });
  } catch (err) {
    console.error("Appointment Create Error:");
    res.status(500).json({ error: err.message });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let appointments;
    if (role === "doctor") {
      appointments = await Appointment.find({ "doctor.id": userId });
    } else {
      appointments = await Appointment.find({ userId: userId });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;