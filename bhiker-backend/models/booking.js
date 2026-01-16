// models/booking.js
const mongoose = require("mongoose");

function makeBookingID() {
    const ts = Date.now().toString().slice(-8);
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BOOK-${ts}-${rnd}`;
}

const bookingSchema = new mongoose.Schema({
    bookingID: {
        type: String,
        required: true,
        unique: true,
        default: makeBookingID
    },
    userID: { type: String, required: true },
    userName: { type: String, required: true }, // For easy reference in emails
    userEmail: { type: String, required: true },
    vendorID: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    productID: { type: String, required: true },
    productName: { type: String, required: true }, // For easy reference in emails
    additionalRequests: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
