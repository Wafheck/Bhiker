const mongoose = require("mongoose");

function makeProductID() {
    const ts  = Date.now().toString().slice(-8);
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PROD-${ts}-${rnd}`;
}

const productSchema = new mongoose.Schema({
    productID: { type: String, required: true, unique: true, default: makeProductID },
    vendorID: {type: String, required: true},
    name: { type: String, required: true },
    type: { type: String, required: true },
    model: { type: String, required: true },
    licenseno: { type: String, required: true },
    price: { type: String, required: true },
    frequency: { type: String, required: true },
    pincode: { type: String, required: true },
    desc: { type: String, required: true},
    available: { type: String, required: true},
    listStatus: { type: String, required: true},
}, { timestamps: true });


module.exports = mongoose.model("Product", productSchema);