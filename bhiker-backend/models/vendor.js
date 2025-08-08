// models/vendor.js
const mongoose = require("mongoose");

function makeVendorID() {
    const ts  = Date.now().toString().slice(-8);
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VEN-${ts}-${rnd}`;
}

const vendorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, required: true },
    vendorID:  {
        type:     String,
        required: true,
        unique:   true,
        default:  makeVendorID      // <-- default populates before validation
    }
}, { timestamps: true });

module.exports = mongoose.model("Vendor", vendorSchema);
