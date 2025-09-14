const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "doctor"
    },
    specialization: {
        type: String
    },
    licenseNumber: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Doctor", doctorSchema);
