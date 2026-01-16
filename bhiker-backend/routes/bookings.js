// routes/bookings.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const Booking = require("../models/booking");
const Product = require("../models/product");
const Vendor = require("../models/vendor");
const { Resend } = require("resend");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a new booking
router.post(
    "/",
    authenticateToken,
    async (req, res) => {
        try {
            const { productID, additionalRequests } = req.body;
            const userID = req.user.userID;
            const userName = `${req.user.firstname} ${req.user.lastname}`;
            const userEmail = req.user.email;

            // Check if user already has an active booking
            const existingBooking = await Booking.findOne({
                userID,
                status: { $in: ["pending", "confirmed"] }
            });

            if (existingBooking) {
                return res.status(400).json({
                    error: "You already have an active booking. Cancel it first to book another."
                });
            }

            // Get product and vendor info
            const product = await Product.findOne({ productID });
            if (!product) {
                return res.status(404).json({ error: "Product not found." });
            }

            const vendor = await Vendor.findOne({ vendorID: product.vendorID });
            if (!vendor) {
                return res.status(404).json({ error: "Vendor not found." });
            }

            // Create booking
            const booking = new Booking({
                userID,
                userName,
                userEmail,
                vendorID: product.vendorID,
                vendorEmail: vendor.email,
                productID,
                productName: product.name,
                additionalRequests: additionalRequests || ""
            });
            await booking.save();

            // Increment booked count on product
            await Product.findOneAndUpdate(
                { productID },
                { $inc: { bookedCount: 1 } }
            );

            // Send email to vendor
            const additionalRequestsText = additionalRequests
                ? `<p><b>Additional Requests from User:</b></p><p style="background:#f5f5f5;padding:10px;border-radius:5px;">${additionalRequests}</p>`
                : "";

            await resend.emails.send({
                from: "hello@support.bhiker.me",
                to: vendor.email,
                subject: `New Booking Request - ${product.name}`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#e3a826;padding:20px;text-align:center;">
                            <h1 style="margin:0;color:#000;font-family:Georgia,serif;letter-spacing:3px;">BHIKER</h1>
                        </div>
                        <div style="padding:20px;background:#fff;">
                            <h2>🎉 New Booking Request!</h2>
                            <p>Great news! Someone wants to book your listing.</p>
                            <h3>Booking Details:</h3>
                            <table style="width:100%;border-collapse:collapse;">
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Listing:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${product.name}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Customer:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${userName}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Booking ID:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${booking.bookingID}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Status:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">Pending</td></tr>
                            </table>
                            ${additionalRequestsText}
                            <p style="margin-top:20px;">Please log in to your dashboard to manage this booking.</p>
                        </div>
                        <div style="text-align:center;padding:15px;background:#f5f5f5;font-size:12px;color:#888;">
                            © 2026 BHIKER. All rights reserved.
                        </div>
                    </div>
                `
            });

            res.status(201).json({
                message: "Booking created successfully",
                booking
            });
        } catch (err) {
            console.error("❌ [BOOKINGS] Error creating booking:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Get user's current active booking
router.get(
    "/mine",
    authenticateToken,
    async (req, res) => {
        try {
            const userID = req.user.userID;
            const booking = await Booking.findOne({
                userID,
                status: { $in: ["pending", "confirmed"] }
            });
            res.json({ booking });
        } catch (err) {
            console.error("❌ [BOOKINGS] Error fetching booking:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Cancel a booking
router.put(
    "/:bookingID/cancel",
    authenticateToken,
    async (req, res) => {
        try {
            const { bookingID } = req.params;
            const userID = req.user.userID;

            const booking = await Booking.findOne({ bookingID });
            if (!booking) {
                return res.status(404).json({ error: "Booking not found." });
            }

            if (booking.userID !== userID) {
                return res.status(403).json({ error: "You can only cancel your own bookings." });
            }

            if (booking.status === "cancelled") {
                return res.status(400).json({ error: "Booking is already cancelled." });
            }

            booking.status = "cancelled";
            await booking.save();

            // Send cancellation email to vendor
            await resend.emails.send({
                from: "hello@support.bhiker.me",
                to: booking.vendorEmail,
                subject: `Booking Cancelled - ${booking.productName}`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#e3a826;padding:20px;text-align:center;">
                            <h1 style="margin:0;color:#000;font-family:Georgia,serif;letter-spacing:3px;">BHIKER</h1>
                        </div>
                        <div style="padding:20px;background:#fff;">
                            <h2>❌ Booking Cancelled</h2>
                            <p>A booking for your listing has been cancelled by the customer.</p>
                            <h3>Booking Details:</h3>
                            <table style="width:100%;border-collapse:collapse;">
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Listing:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${booking.productName}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Customer:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${booking.userName}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Booking ID:</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${booking.bookingID}</td></tr>
                                <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Status:</b></td><td style="padding:8px;border-bottom:1px solid #eee;color:red;">Cancelled</td></tr>
                            </table>
                            <p style="margin-top:20px;">Your listing is now available for other customers.</p>
                        </div>
                        <div style="text-align:center;padding:15px;background:#f5f5f5;font-size:12px;color:#888;">
                            © 2026 BHIKER. All rights reserved.
                        </div>
                    </div>
                `
            });

            res.json({ message: "Booking cancelled successfully", booking });
        } catch (err) {
            console.error("❌ [BOOKINGS] Error cancelling booking:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
