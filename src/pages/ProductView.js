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
        fetchProduct();
    }, [user, productID, navigate]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        navigate("/landingpage");
    };

    const handleBookNow = () => {
        // Placeholder for booking logic
        setBookingMessage("Booking request sent! The vendor will contact you soon.");
        // In production, this would call an API to create a booking
    };

    const handleGoBack = () => {
        navigate("/home");
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

                            {bookingMessage ? (
                                <div className="booking-success">
                                    ✅ {bookingMessage}
                                </div>
                            ) : (
                                <button onClick={handleBookNow} className="book-now-button">
                                    📅 Book Now
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductView;
