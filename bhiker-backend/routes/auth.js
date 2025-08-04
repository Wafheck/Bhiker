const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");

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

router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ firstname, lastname, email, password: hashedPassword });
        await user.save();

        const mailOptions = {
            from: '"Bhiker" <support@bhiker.me>',
            to: email,
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

        try {
            console.log("📧 Attempting to send welcome email...");

            const info = await transporter.sendMail(mailOptions);

            console.log("✅ Welcome email sent successfully");
            console.log("Message ID:", info.messageId);
            console.log("Response:", info.response);

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

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
