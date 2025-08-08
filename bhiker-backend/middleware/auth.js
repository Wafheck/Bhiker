const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

const requireVendor = (req, res, next) => {
    if (req.user.role !== "vendor") {
        return res.status(403).json({ message: "Vendor access required" });
    }
    if (!req.user.vendorID) {
        return res.status(400).json({ message: "Vendor ID required" });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireVendor,
};
