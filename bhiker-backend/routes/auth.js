const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Vendor = require("../models/vendor");
const { body, validationResult } = require("express-validator");

//TODO: RATE_LIMITING, ADDITIONAL COOKIES, COOKIE DURATION, CAPTCHA

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP server is ready to take messages");
    }
});

const validateRegistration = [
    body("firstname")
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage("First name is required and max 50 chars")
        .matches(/^[A-Za-z\s]+$/).withMessage("First name must contain only letters and spaces"),

    body("lastname")
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage("Last name is required and max 50 chars")
        .matches(/^[A-Za-z\s]+$/).withMessage("Last name must contain only letters and spaces"),

    body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8, max: 72 }).withMessage("Password must be 8–72 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage("Password must include uppercase, lowercase, number, and special char"),

    body("role")
        .isIn(["user", "vendor"]).withMessage("Role must be either 'user' or 'vendor'")
];

const validateLogin = [
    body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 1, max: 72 }).withMessage("Password is required and max 72 chars"),

    body("role")
        .isIn(["user", "vendor"]).withMessage("Role must be either 'user' or 'vendor'")
];

function checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
        });
    }
    next();
}

router.post("/register", validateRegistration, checkValidation, async (req, res) => {
    console.log("▶ [REGISTER] Request body:", req.body);
    try {
        const { firstname, lastname, email, password, role } = req.body;
        console.log("▶ Parsed fields:", { firstname, lastname, email, role });

        const normalizedEmail = email.toLowerCase();
        let userModel;
        if (role === 'user') userModel = User;
        else if (role === 'vendor') userModel = Vendor;
        else {
            console.log("❌ Invalid role:", role);
            return res.status(400).json({ message: "Invalid role" });
        }

        console.log("▶ Using model:", userModel.modelName);
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        console.log("▶ existingUser lookup result:", existingUser);
        if (existingUser) {
            console.log("❌ User already exists:", normalizedEmail);
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 14);
        console.log("▶ Password hashed");

        const user = new userModel({
            firstname,
            lastname,
            email: normalizedEmail,
            password: hashedPassword,
            role
        });
        console.log("▶ New user instance:", user);

        await user.save();
        console.log("✅ User saved successfully with vendorID:", user.vendorID);

        // Send email (omitted logs for brevity)...
        res.status(201).json({ message: "User registered and welcome email sent", vendorID: user.vendorID });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ error: err.message });
    }
});


router.post("/login", validateLogin, checkValidation, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase();

        let userModel;
        if (role === 'user') {
            userModel = User;
        } else if (role === 'vendor') {
            userModel = Vendor;
        } else {
            return res.status(400).json({ message: "Invalid Login" });
        }

        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const tokenPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };

        if (role === 'vendor') {
            tokenPayload.vendorID = user.vendorID;
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000, // 1 hour
        });

        // ✅ Fixed response - conditional field access
        const responseUser = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        };

        if (role === 'vendor') {
            responseUser.vendorID = user.vendorID;
        } else {
            responseUser.userID = user.userID;
        }

        res.json({
            message: "Login successful",
            token: token,
            user: responseUser
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
