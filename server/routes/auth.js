const express = require('express');
const router = express.Router();
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth')

//Register
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, specialization, licenseNumber } = req.body;

        const patientExists = await Patient.findOne({ email });
        const doctorExists = await Doctor.findOne({ email });
        const adminExists = await Admin.findOne({ email });

        if (patientExists || doctorExists || adminExists) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 12);

        let newUser;
        if (role === "patient") {
            newUser = new Patient({ firstName, lastName, email, password: hash, role });
        } else if (role === "doctor") {
            newUser = new Doctor({ firstName, lastName, email, password: hash, role, specialization, licenseNumber });
        } else {
            newUser = new Admin({ firstName, lastName, email, password: hash, role });
        }

        await newUser.save();
        res.status(201).json({ msg: "Registration successful" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const models = [Patient, Doctor, Admin];
        let user = null;

        for (const Model of models) {
            const found = await Model.findOne({ email });
            if (found) {
                user = found;
                break;
            }
        }

        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.json({
            msg: 'Logged in successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                licenseNumber: user.licenseNumber ? user.licenseNumber : null
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



//Logout
router.post("/logout", (_, res) => {
    res.clearCookie("token").json({ msg: "Logged out" });
});

//User
router.get('/user', verifyToken, async (req, res) => {
    const { id, role } = req.user

    let User
    if (role == "patient") User = Patient
    else if (role == "doctor") User = Doctor
    else User = Admin

    try {
        const user = await User.findById(id).select('_id email role')
        if (!user) return res.status(404).json({ msg: "User not found" })

        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router;