const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    doctor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        },
        firstName: {
            type: String
        },
        lastName: {
            type: String
        }
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    comType: {
        type: String,
        enum: ["Phone Call", "Video Call", "In-Person"],
        default: "Video Call"
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    notes: {
        type: String
    },
    action: {
        type: String,
        enum: ["Join Call", "View Notes"],
        default: "Join Call"
    }
})

module.exports = mongoose.model("Appointment", appointmentSchema);