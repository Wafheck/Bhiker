import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import userIcon from "../icons/user.png";
import Userlocation from "../components/userlocation";
import { modelImageMap, placeholderImage } from "../utils/vehicleImages";
import fixDefaultIcon from "../utils/mapiconfix";
import LocationContext from "../context/locationcontext";

fixDefaultIcon();

function ProductView() {
    const navigate = useNavigate();
    const location = useLocation();
    const productID = location.state?.productID;
    const { location: userLocation } = useContext(LocationContext);

    const [user, setUser] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [position, setPosition] = useState([13.3557, 74.7898]);
    const [bookingMessage, setBookingMessage] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [additionalRequests, setAdditionalRequests] = useState("");
    const [activeBooking, setActiveBooking] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            alert("Please log in first.");
            navigate("/login");
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    useEffect(() => {
        if (!user || !productID) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        async function fetchProduct() {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/products/view/${productID}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (!res.ok) throw new Error("Product not found or unavailable");
                const data = await res.json();
                setProduct(data);
                setLoading(false);

                // Geocode the pincode to get map position
                if (data.pincode) {
                    try {
                        const geoRes = await fetch(
                            `https://nominatim.openstreetmap.org/search?postalcode=${data.pincode}&country=India&format=json&limit=1`
                        );
                        const geoData = await geoRes.json();
                        if (geoData && geoData.length > 0) {
                            setPosition([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                        }
                    } catch (geoErr) {
                        console.error("Geocoding failed:", geoErr);
                    }
                }
            } catch (err) {
                console.error("Fetch product error:", err);
                setError(err.message);
                setLoading(false);
            }
        }

        async function fetchActiveBooking() {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/bookings/mine`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    setActiveBooking(data.booking);
                }
            } catch (err) {
                console.error("Fetch booking error:", err);
            }
        }

        fetchProduct();
        fetchActiveBooking();
    }, [user, productID, navigate]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        navigate("/landingpage");
    };

    const handleBookNow = async () => {
        const token = localStorage.getItem("authToken");
        setIsBooking(true);
        setBookingError("");

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productID,
                        additionalRequests
                    })
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setBookingError(data.error || "Failed to create booking");
            } else {
                setBookingMessage("Booking request sent! The vendor has been notified.");
                setActiveBooking(data.booking);
            }
        } catch (err) {
            setBookingError("Failed to create booking. Please try again.");
        }
        setIsBooking(false);
    };

    const handleCancelBooking = async () => {
        if (!activeBooking) return;
        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/bookings/${activeBooking.bookingID}/cancel`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (res.ok) {
                setActiveBooking(null);
                setBookingMessage("");
                setBookingError("");
            }
        } catch (err) {
            console.error("Cancel booking error:", err);
        }
    };

    const handleGoBack = () => {
        navigate("/home");
    };

    // Helper functions
    const formatListedTime = (createdAt) => {
        const now = new Date();
        const listed = new Date(createdAt);
        const diffMs = now - listed;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `Listed ${diffMins} minutes ago`;
        if (diffHours < 24) return `Listed ${diffHours} hours ago`;
        if (diffDays === 1) return "Listed yesterday";
        if (diffDays < 7) return `Listed ${diffDays} days ago`;
        return `Listed on ${listed.toLocaleDateString()}`;
    };

    const formatBookedCount = (count) => {
        if (!count || count === 0) return "No bookings yet";
        if (count < 5) return `${count} bookings`;
        if (count < 10) return "5+ bookings";
        if (count < 20) return "10+ bookings";
        if (count < 50) return "20+ bookings";
        if (count < 100) return "50+ bookings";
        if (count < 200) return "100+ bookings";
        return "200+ bookings";
    };

    const getTrustBadgeClass = (trustLevel) => {
        switch (trustLevel) {
            case "new": return "trust-badge new";
            case "nominal": return "trust-badge nominal";
            case "high": return "trust-badge high";
            default: return "trust-badge";
        }
    };

    if (!productID) {
        return (
            <div className="app">
                <div style={{ padding: 40, textAlign: "center" }}>
                    <h2>Product not found</h2>
                    <button onClick={handleGoBack} className="view-button" style={{ marginTop: 20 }}>
                        Go Back to Browse
                    </button>
                </div>
            </div>
        );
    }

    const productImage = product ? (modelImageMap[product.model] || placeholderImage) : placeholderImage;
    const hasActiveBookingForThis = activeBooking && activeBooking.productID === productID;

    return (
        <div className="app">
            <header className="home-header">
                <div className="home-left">
                    <a onClick={handleGoBack} className="logo" style={{ cursor: "pointer" }}>BHIKER</a>
                    <span className="home-decor1" />
                    <span className="home-decor2">Welcome, {user?.firstname}</span>
                </div>

                <div className="home-center">
                    <span className="home-location">📍 <Userlocation /></span>
                </div>

                <div className="home-right">
                    <img src={userIcon} alt="user icon" width={32} height={32}
                        style={{ cursor: "pointer", borderRadius: "50%" }}
                        onClick={toggleDropdown}
                    />
                    {showDropdown && (
                        <div className="usermenu-drop">
                            <div className="usermenu-drop1">
                                {user?.firstname} {user?.lastname}
                            </div>
                            <button onClick={handleLogout} className="usermenu-logout">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="product-view-container">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <p>Loading product...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <p style={{ color: "red" }}>{error}</p>
                        <button onClick={handleGoBack} className="view-button" style={{ marginTop: 20 }}>
                            Go Back to Browse
                        </button>
                    </div>
                ) : product && (
                    <div className="product-view-content">
                        <div className="product-view-left">
                            <button onClick={handleGoBack} className="back-button" style={{ marginBottom: 15 }}>
                                ← Back to Browse
                            </button>
                            <img
                                src={product.imageUrl || productImage}
                                alt={product.name}
                                className="product-view-image"
                            />

                            {/* Vendor Details Section */}
                            {product.vendor && (
                                <div className="vendor-section">
                                    <h3>Vendor Details</h3>
                                    <div className="vendor-info">
                                        <div className="vendor-row">
                                            <span className="vendor-label">Name:</span>
                                            <span className="vendor-value">{product.vendor.name}</span>
                                        </div>
                                        <div className="vendor-row">
                                            <span className="vendor-label">Trust:</span>
                                            <span className={getTrustBadgeClass(product.vendor.trustLevel)}>
                                                {product.vendor.trustLabel}
                                            </span>
                                        </div>
                                        <div className="vendor-row">
                                            <span className="vendor-label">Listed:</span>
                                            <span className="vendor-value">{formatListedTime(product.createdAt)}</span>
                                        </div>
                                        <div className="vendor-row">
                                            <span className="vendor-label">Popularity:</span>
                                            <span className="booked-badge">{formatBookedCount(product.bookedCount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="product-view-right">
                            <h1 className="product-view-title">{product.name}</h1>

                            <div className="product-view-type">
                                <span className={`type-tag ${product.type}`}>{product.type}</span>
                            </div>

                            <div className="product-view-details">
                                <div className="detail-row">
                                    <span className="detail-label">Model:</span>
                                    <span className="detail-value">{product.model?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Price:</span>
                                    <span className="detail-value price">₹{product.price} / {product.frequency}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Availability:</span>
                                    <span className="detail-value">{product.available}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Location:</span>
                                    <span className="detail-value">{product.pincode}</span>
                                </div>
                            </div>

                            {product.desc && (
                                <div className="product-view-description">
                                    <h3>Description</h3>
                                    <p>{product.desc}</p>
                                </div>
                            )}

                            <div className="product-view-map">
                                <h3>Location</h3>
                                <MapContainer
                                    center={position}
                                    zoom={13}
                                    style={{ height: 200, borderRadius: 8, border: "1px solid #ccc" }}
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={position} />
                                </MapContainer>
                            </div>

                            {/* Booking Section */}
                            <div className="booking-section">
                                {hasActiveBookingForThis ? (
                                    <div className="active-booking">
                                        <div className="booking-success">
                                            ✅ You have booked this vehicle!
                                        </div>
                                        <p>Booking ID: {activeBooking.bookingID}</p>
                                        <p>Status: {activeBooking.status}</p>
                                        <button onClick={handleCancelBooking} className="cancel-booking-button">
                                            ❌ Cancel Booking
                                        </button>
                                    </div>
                                ) : activeBooking ? (
                                    <div className="booking-blocked">
                                        <p>⚠️ You already have an active booking.</p>
                                        <p>Cancel your current booking to book another vehicle.</p>
                                        <button
                                            onClick={() => navigate("/product", { state: { productID: activeBooking.productID } })}
                                            className="view-button"
                                        >
                                            View Current Booking
                                        </button>
                                    </div>
                                ) : bookingMessage ? (
                                    <div className="booking-success">
                                        ✅ {bookingMessage}
                                    </div>
                                ) : (
                                    <>
                                        <h3>Book This Vehicle</h3>
                                        <textarea
                                            className="additional-requests"
                                            placeholder="Any additional requests? (optional)"
                                            value={additionalRequests}
                                            onChange={(e) => setAdditionalRequests(e.target.value)}
                                            rows={3}
                                        />
                                        {bookingError && <p className="booking-error">{bookingError}</p>}
                                        <button
                                            onClick={handleBookNow}
                                            className="book-now-button"
                                            disabled={isBooking}
                                        >
                                            {isBooking ? "Booking..." : "📅 Book Now"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductView;
