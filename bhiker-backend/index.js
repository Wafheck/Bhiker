const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); // Add this import
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

axios.defaults.withCredentials = true;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001' , 'https://www.bhiker.me'],
    credentials: true
}));

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);


// Add these connection event listeners **before** mongoose.connect()
mongoose.connection.on("connected", () => {
    console.log("Mongoose default connection is open");
});

mongoose.connection.on("error", (err) => {
    console.log(`Mongoose default connection error: ${err}`);
});

// SELF-PING SETUP - Add this section
const RENDER_URL = 'https://bhiker.onrender.com'; // Your actual Render backend URL
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes in milliseconds

function keepAlive() {
    axios.get(RENDER_URL)
        .then(response => {
            console.log(`✅ Keep-alive ping successful at ${new Date().toISOString()}: Status ${response.status}`);
        })
        .catch(error => {
            console.error(`❌ Keep-alive ping failed at ${new Date().toISOString()}:`, error.message);
        });
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // Start keep-alive pings only in production (on Render)
        if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
            setInterval(keepAlive, PING_INTERVAL);
            console.log('🔄 Keep-alive pings started (every 14 minutes)');
        }
    });
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// Root route for quick test
app.get("/", (req, res) => {
    res.send("Backend is running");
});
