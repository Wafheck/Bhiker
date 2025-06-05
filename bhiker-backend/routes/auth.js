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

router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({ message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ firstname, lastname, email, password: hashedPassword });
        await user.save();

        const mailOptions = {
            from:'"Bhiker" <support@bhiker.com>',
            to: email,
            subject: `Welcome to Bhiker, ${firstname}!`,
            html: `
  <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1;">
    <div style="max-width: 600px; margin: auto; padding: 16px;">
      <a href="https://bhiker.me" target="_blank" rel="noopener">
        <img src="https://i.ibb.co/tFyjQZx/unnamed.png" alt="Bhiker" style="max-width: 100%; height: auto;">
      </a>
    </div>
    <div style="max-width: 600px; margin: auto; padding: 16px;">
      Hello, ${firstname}!<br>
      <p>Welcome to the BHIKER family! We're excited to have you on board.</p>
      <p>Your account has been successfully created, and you're now ready to explore all the great features we offer. Bhiker is currently in it's pre-alpha stage, we appreciate your usage and look forward to receiving valuable feedback and suggestions.</p>
      <p><strong>
        <a style="display: inline-block; text-decoration: none; outline: none; color: #000000; background-color: #f1c40f; padding: 8px 16px; border-radius: 4px;" 
           href="https://bhiker.me/login" target="_blank" rel="noopener">
          &nbsp;Open BHIKER
        </a>
      </strong></p>
      <p>If you have any questions or would like to provide feedback, our team is just an email away at support@bhiker.com. We're here to assist you every step of the way!</p>
      <p>Best regards,<br>
      <a href="https://github.com/wafheck" target="_blank" rel="noopener">Wafheck</a></p>
    </div>
  </div>
  `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email failed to send:", error);
            } else {
                console.log("Welcome email sent:", info.response);
            }
        });

        res.status(201).json({ message: "User Registered successfully"  });
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
            { expiresIn: "1h"}
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