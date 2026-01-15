const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const User = require("../models/user");
const Vendor = require("../models/vendor");
const { body, validationResult } = require("express-validator");

//TODO: RATE_LIMITING, ADDITIONAL COOKIES, COOKIE DURATION, CAPTCHA

const router = express.Router();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Log email config at startup
console.log("📧 Email config (Resend):", {
    apiKeyConfigured: process.env.RESEND_API_KEY ? "YES" : "NOT SET!"
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

        // Send welcome email
        try {
            // Determine subject and content based on role
            const isVendor = role === 'vendor';
            const subject = isVendor
                ? `Your Bhiker Vendor Account has been successfully created!`
                : `Welcome to Bhiker, ${firstname} ${lastname}!`;

            const welcomeMessage = isVendor
                ? `Welcome to the <span style="color: #D4A017; font-weight: bold;">BHIKER</span> Vendor! We're excited to have you on board.`
                : `Welcome to the <span style="color: #D4A017; font-weight: bold;">BHIKER</span> family! We're excited to have you on board.`;

            const accountMessage = isVendor
                ? `Your vendor account has been successfully created, and you're now ready to explore all the great features we offer.`
                : `Your account has been successfully created, and you're now ready to explore all the great features we offer.`;

            // Send email using Resend API
            const { data, error } = await resend.emails.send({
                from: "Bhiker <support@bhiker.me>",
                to: [normalizedEmail],
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                        <!-- Logo -->
                        <div style="margin-bottom: 30px;">
                            <span style="font-size: 28px; font-weight: bold; color: #D4A017; border-left: 4px solid #D4A017; padding-left: 10px;">BHIKER</span>
                        </div>
                        
                        <!-- Greeting -->
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello, ${firstname} ${lastname}!</p>
                        
                        <!-- Welcome message -->
                        <p style="font-size: 15px; margin-bottom: 15px;">${welcomeMessage}</p>
                        
                        <!-- Account info -->
                        <p style="font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
                            ${accountMessage} <span style="color: #D4A017; font-weight: bold;">BHIKER</span> is currently in its pre-alpha stage, we appreciate your usage and look forward to receiving valuable feedback and suggestions.
                        </p>
                        
                        <!-- CTA Button -->
                        <div style="margin: 25px 0;">
                            <a href="https://www.bhiker.me" 
                               style="background-color: #D4A017; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; display: inline-block;">
                                Open BHIKER
                            </a>
                        </div>
                        
                        <!-- Support message -->
                        <p style="font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
                            If you have any questions or would like to provide feedback, our team is just an email away at 
                            <a href="mailto:support@bhiker.me" style="color: #333;">support@bhiker.me</a>. 
                            We're here to assist you every step of the way!
                        </p>
                        
                        <!-- Signature -->
                        <p style="font-size: 14px; margin-top: 30px;">
                            Best regards,<br>
                            <a href="https://www.github.com/wafheck" style="color: #1a73e8; text-decoration: none;">Wafheck</a>
                        </p>
                    </div>
                `
            });

            if (error) {
                console.error("❌ Resend error:", error);
            } else {
                console.log("✅ Welcome email sent to:", normalizedEmail, "ID:", data.id);
            }
        } catch (emailErr) {
            console.error("❌ Failed to send welcome email:", emailErr.message);
            // Don't fail registration if email fails - just log it
        }

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
