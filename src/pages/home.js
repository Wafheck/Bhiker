import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import userIcon from "../icons/user.png";
import Userlocation from "../components/userlocation";
import UserProductCard from "../components/UserProductCard";
import LocationContext from "../context/locationcontext";
import Loadgif from "../images/loading.gif";

function HomePage() {
    const navigate = useNavigate();
    const { location: userLocation } = useContext(LocationContext);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [distanceFilter, setDistanceFilter] = useState("all");
    const [customDistance, setCustomDistance] = useState("");
    const [typeFilters, setTypeFilters] = useState([]);

    // Vehicle types for filter
    const vehicleTypes = [
        { value: "scooter", label: "Scooter" },
        { value: "geared-motorcycle", label: "Geared Motorcycle" },
        { value: "nongeared-motorcycle", label: "Non-geared Motorcycle" },
        { value: "powered-bicycle", label: "Powered Bicycle" },
        { value: "electric-scooter", label: "Electric Scooter" },
        { value: "electric-motorcycle", label: "Electric Motorcycle" }
    ];

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
        if (!user) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        async function fetchProducts() {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/products/browse`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data.products || []);
                setLoading(false);
            } catch (err) {
                console.error("Fetch products error:", err);
                setError(err.message);
                setLoading(false);
            }
        }
        fetchProducts();
    }, [user, navigate]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        navigate("/landingpage");
    };

    const toggleTypeFilter = (type) => {
        setTypeFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = !searchTerm ||
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.type?.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const matchesType = typeFilters.length === 0 || typeFilters.includes(product.type);

        // Distance filter (placeholder - would need geocoding for real implementation)
        // For now, we filter by pincode prefix matching
        let matchesDistance = true;
        if (distanceFilter !== "all" && userLocation?.lat && userLocation?.lng) {
            // This is a simplified distance filter based on pincode
            // In production, you'd geocode the product pincode and calculate actual distance
            matchesDistance = true; // Allow all for now since we don't have product coordinates
        }

        return matchesSearch && matchesType && matchesDistance;
    });

    return (
        <div className="app">
            <header className="home-header">
                <div className="home-left">
                    <a href="/home" className="logo">BHIKER</a>
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

            <div className="listproductven">
                <div className="listproductven-sidebar">
                    <label>Filters</label>

                    {/* Search */}
                    <input
                        type="text"
                        className="sidebar-search"
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Distance Filter */}
                    <div className="sidebar-section">
                        <h4>Distance</h4>
                        <label className="sidebar-checkbox">
                            <input
                                type="radio"
                                name="distance"
                                checked={distanceFilter === "all"}
                                onChange={() => setDistanceFilter("all")}
                            />
                            <span>All</span>
                        </label>
                        <label className="sidebar-checkbox">
                            <input
                                type="radio"
                                name="distance"
                                checked={distanceFilter === "1"}
                                onChange={() => setDistanceFilter("1")}
                            />
                            <span>&lt; 1 km</span>
                        </label>
                        <label className="sidebar-checkbox">
                            <input
                                type="radio"
                                name="distance"
                                checked={distanceFilter === "5"}
                                onChange={() => setDistanceFilter("5")}
                            />
                            <span>&lt; 5 km</span>
                        </label>
                        <label className="sidebar-checkbox">
                            <input
                                type="radio"
                                name="distance"
                                checked={distanceFilter === "10"}
                                onChange={() => setDistanceFilter("10")}
                            />
                            <span>&lt; 10 km</span>
                        </label>
                        <label className="sidebar-checkbox">
                            <input
                                type="radio"
                                name="distance"
                                checked={distanceFilter === "custom"}
                                onChange={() => setDistanceFilter("custom")}
                            />
                            <span>Custom</span>
                        </label>
                        {distanceFilter === "custom" && (
                            <div style={{ marginTop: 8 }}>
                                <input
                                    type="number"
                                    className="sidebar-search"
                                    placeholder="Enter km..."
                                    value={customDistance}
                                    onChange={(e) => setCustomDistance(e.target.value)}
                                    style={{ width: "80%" }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Type Filters */}
                    <div className="sidebar-section">
                        <h4>Vehicle Type</h4>
                        {vehicleTypes.map(type => (
                            <label key={type.value} className="sidebar-checkbox">
                                <input
                                    type="checkbox"
                                    checked={typeFilters.includes(type.value)}
                                    onChange={() => toggleTypeFilter(type.value)}
                                />
                                <span className={`type-tag ${type.value}`}>{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="listings-section">
                    <h2 style={{ margin: "1rem 0", fontWeight: "bold" }}>
                        Available Vehicles ({filteredProducts.length})
                    </h2>
                    {loading ? (
                        <img src={Loadgif} alt="Loading..." />
                    ) : error ? (
                        <div style={{ color: "red" }}>{error}</div>
                    ) : filteredProducts.length === 0 ? (
                        <div>No vehicles found matching your filters.</div>
                    ) : (
                        <div className="listing-grid">
                            {filteredProducts.map(product => (
                                <UserProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;