const mongoose = require("mongoose");

 const vendorSchema = new mongoose.Schema({
     firstname: { type: String, required: true },
     lastname: { type: String, required: true },
     email: { type: String, required: true },
     password: { type: String, required: true },
     role: { type: String, required: true },
     vendorID: { type: String, required: true, unique: true },
}, { timestamps: true });

vendorSchema.pre("save", function(next) {
    if (!this.vendorID) {
        const ts = Date.now().toString().slice(-8);
        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.vendorID = `VEN-${ts}-${rnd}`
    }
    next();
});

 module.exports = mongoose.model("Vendor", vendorSchema);