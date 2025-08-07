const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productID: { type: String, required: true },
    productName: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Vendor", productSchema);