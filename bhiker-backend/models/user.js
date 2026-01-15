const mongoose = require("mongoose");

function makeUserID() {
    const ts = Date.now().toString().slice(-8);
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `USR-${ts}-${rnd}`;
}
const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    userID: {
        type: String,
        required: true,
        unique: true,
        default: makeUserID
    },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);