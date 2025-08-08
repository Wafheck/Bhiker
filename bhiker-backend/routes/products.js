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

module.exports = router;
