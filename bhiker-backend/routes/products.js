const express = require("express");
const { authenticateToken, requireVendor } = require("../middleware/auth")
const Product = require("../models/product");
const router = express.Router();

router.post(
    "/",
    authenticateToken,
    requireVendor,
    async (req, res) => {
        console.log("▶ [PRODUCTS] Authenticated user:", req.user);
        console.log("▶ [PRODUCTS] Request body:", req.body);

        try {
            const product = new Product(req.body);
            console.log("▶ [PRODUCTS] New Product instance:", product);
            await product.save();
            console.log("✅ [PRODUCTS] Saved:", product);
            return res.status(201).json({ message: "Product created", product });
        } catch (err) {
            console.error("❌ [PRODUCTS] Error saving product:", err);
            return res.status(400).json({ error: err.message });
        }
    }
);

router.get(
    "/:productID",
    authenticateToken,
    requireVendor,
    async (req, res) => {
        try {
            const { productID } = req.params;
            const product = await Product.findOne({ productID });
            if (!product) {
                return res.status(404).json({ error: "Product not found." });
            }
            res.json(product);
        } catch (err) {
            console.error("❌ [PRODUCTS] Error fetching product:", err);
            res.status(500).json({ error: err.message });
        }
    }
);


router.get(
    "/mine",
    authenticateToken,   // checks JWT, sets req.user
    requireVendor,       // ensures only vendors
    async (req, res) => {
        try {
            // req.user.vendorID is set by JWT (see token generation in your login route)
            const vendorID = req.user.vendorID;
            if (!vendorID) {
                return res.status(403).json({ error: "Missing vendorID in token." });
            }
            const listings = await Product.find({ vendorID }).sort({ createdAt: -1 });
            res.json({ listings });
        } catch (err) {
            console.error("❌ [PRODUCTS] Fetch vendor listings failed:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
