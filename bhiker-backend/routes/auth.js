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
    try {
        const { firstname, lastname, email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase();

        let userModel;

        if (role === 'user'){
            userModel = User;
        }

        else if (role === 'vendor'){
            userModel = Vendor;
        }

        else {
            return res.status(400).json({ message: "Invalid role" });
        }

        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 14);

        const user = new userModel({firstname, lastname, email: normalizedEmail, password: hashedPassword, role});
        await user.save();

        const mailOptions = {
            from: '"Bhiker" <support@bhiker.me>',
            to: normalizedEmail,
            subject: `Welcome to Bhiker, ${firstname}!`,
            html: `
                    <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1;">
                         <div style="max-width: 600px; margin: auto; padding: 16px;">
                            <a href="https://bhiker.me" target="_blank" rel="noopener">
                                <img src="https://i.ibb.co/kg91PM1Y/unnamed.png" alt="" style="max-width: 100%; height: auto;">
                            </a>
                        </div>
                        <div style="max-width: 600px; margin: auto; padding: 16px;">
                            Hello, ${firstname}!<br>
                            <p>Welcome to the BHIKER family! We're excited to have you on board.</p>
                            <p>Your account has been successfully created, and you're now ready to explore all the great features we offer. BHIKER is currently in its pre-alpha stage, we appreciate your usage and look forward to receiving valuable feedback and suggestions.</p>
                            <p>
                                <a href="https://bhiker.me/login"
                                    target="_blank"
                                    rel="noopener"
                                    style="display: inline-block;
                                            text-decoration: none;
                                            color: #000000 !important;
                                            background-color: #f1c40f;
                                            padding: 8px 16px;
                                            border-radius: 4px;
                                            font-weight: bold;
                                            font-family: system-ui, sans-serif, Arial;
                                            font-size: 16px;">
                                    Open BHIKER
                                </a>
                            </p>
                            <p>If you have any questions or would like to provide feedback, our team is just an email away at support@bhiker.me. We're here to assist you every step of the way!</p>
                            <p>Best regards,<br>
                            <a href="https://github.com/wafheck" target="_blank" rel="noopener">Wafheck</a></p>
                        </div>
                    </div>`
        };
        const mailVendors = {
            from: '"Bhiker" <support@bhiker.me>',
            to: normalizedEmail,
            subject: `Your Bhiker Vendor Account has been successfully created!`,
            html: `
                    <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1;">
                         <div style="max-width: 600px; margin: auto; padding: 16px;">
                            <a href="https://bhiker.me" target="_blank" rel="noopener">
                                <img src="https://i.ibb.co/kg91PM1Y/unnamed.png" alt="" style="max-width: 100%; height: auto;">
                            </a>
                        </div>
                        <div style="max-width: 600px; margin: auto; padding: 16px;">
                            Hello, ${firstname}!<br>
                            <p>Welcome to the BHIKER Vendor! We're excited to have you on board.</p>
                            <p>Your vendor account has been successfully created, and you're now ready to explore all the great features we offer. BHIKER is currently in its pre-alpha stage, we appreciate your usage and look forward to receiving valuable feedback and suggestions.</p>
                            <p>
                                <a href="https://bhiker.me/login"
                                    target="_blank"
                                    rel="noopener"
                                    style="display: inline-block;
                                            text-decoration: none;
                                            color: #000000 !important;
                                            background-color: #f1c40f;
                                            padding: 8px 16px;
                                            border-radius: 4px;
                                            font-weight: bold;
                                            font-family: system-ui, sans-serif, Arial;
                                            font-size: 16px;">
                                    Open BHIKER
                                </a>
                            </p>
                            <p>If you have any questions or would like to provide feedback, our team is just an email away at support@bhiker.me. We're here to assist you every step of the way!</p>
                            <p>Best regards,<br>
                            <a href="https://github.com/wafheck" target="_blank" rel="noopener">Wafheck</a></p>
                        </div> 
                    </div>`
        }

        try {
            console.log("📧 Attempting to send welcome email...");
            if (role === 'user') {
                const info = await transporter.sendMail(mailOptions);
                console.log("✅ Welcome email sent successfully");
                console.log("Message ID:", info.messageId);
                console.log("Response:", info.response);
            }

            else if (role === 'vendor') {
                const info = await transporter.sendMail(mailVendors);
                console.log("✅ Vendor email sent successfully");
                console.log("Message ID:", info.messageId);
                console.log("Response:", info.response);
            }

            res.status(201).json({ message: "User registered and welcome email sent" });

        } catch (emailError) {
            console.error("❌ Failed to send welcome email:", emailError);
            res.status(201).json({
                message: "User registered, but welcome email failed",
                emailError: emailError.message
            });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", validateLogin, checkValidation, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase();

        let userModel;

        if (role === 'user'){
            userModel = User;
        }

        else if (role === 'vendor'){
            userModel = Vendor;
        }

        else{
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        });

        res.json({
            message: "Login successful",
            user: {
                firstname: user.firstname,
                lastname:  user.lastname,
                email:     user.email,
                role:      user.role,
                vendorID:  user.vendorID  // now available to frontend
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
