const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Add these connection event listeners **before** mongoose.connect()
mongoose.connection.on("connected", () => {
    console.log("Mongoose default connection is open");
});

mongoose.connection.on("error", (err) => {
    console.log(`Mongoose default connection error: ${err}`);
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// Root route for quick test
app.get("/", (req, res) => {
    res.send("Backend is running");
});
