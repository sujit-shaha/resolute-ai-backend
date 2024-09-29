const mongoose = require("mongoose");
const { Schema } = mongoose;

const meetingUserSchema = new Schema(
    {
        socketId: {
            type: String,
        },
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting", // Ensure this 'Meeting' model exists and is properly defined
        },
        userId: {
            type: String,
            required: true,
        },
        joined: {
            type: Boolean,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        isAlive: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true } // Corrected the typo for timestamps
);

// Export the model
const meetingUser = mongoose.model("MeetingUser", meetingUserSchema);

module.exports = {
    meetingUser,
};
