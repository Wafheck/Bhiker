const express = require("express");
const { authenticateToken, requireVendor } = require("../middleware/auth");
const Product = require("../models/product");
const router = express.Router();

router.post(
    "/",
    authenticateToken,
    requireVendor,
    async (req, res) => {
        try {
            const product = new Product(req.body);
            await product.save();
            res.status(201).json({ message: "Product created", product });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

module.exports = router;