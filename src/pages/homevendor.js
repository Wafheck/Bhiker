import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import userIcon from "../icons/user.png";
import addIcon from "../icons/add.png";
import Userlocation from "../components/userlocation";

function HomePageVendor() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        // Only run if there is a logged-in user
        if (!user) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        async function fetchListings() {
            try {
                // Replace with your API URL
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/products/mine`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch listings");
                const data = await res.json();
                setListings(data.listings);
                setLoading(false);
            } catch (err) {
                console.error("Fetch listings error:", err);
                if (err.response) {
                    console.error("Response data:", err.response);
                    setError(`Error ${err.response.status}: ${err.response.statusText || 'Failed to fetch listings'}`);
                } else {
                    setError(err.message);
                }
                setLoading(false);
            }
        }
        fetchListings();
    }, [user, navigate]);


    const toggleShowDropdown = () => {
        setShowUserDropdown(prev => !prev);
        setShowAddDropdown(false);
    };

    const toggleAddDropdown = () => {
        setShowAddDropdown(prev => !prev);
        setShowUserDropdown(false);
    }

    const handleLogout = () => {
        localStorage.removeItem("user");
        alert("Attempt to logout");
        navigate("/landingpage");
    }

    const handleAddListing = () => {
        navigate("/AddListing");
    }

    const handleHome = () => {
        navigate("/HomeVendor");
    }

    const handleSettings = () => {
        navigate("/VendorSettings");
    }

    function ListingCard({ listing }) {
        return (
            <div className="listing-card">
                {/* Use your image logic; fallback if missing */}
                <img src={listing.imageUrl || "https://via.placeholder.com/300x150?text=No+Image"} alt={listing.model} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}/>
                <h3>{listing.name}</h3>
                <p><b>Type:</b> {listing.type}</p>
                <p><b>Model:</b> {listing.model}</p>
                <p><b>License No:</b> {listing.licenseno}</p>
                <p><b>Price:</b> ₹{listing.price} / {listing.frequency}</p>
                <p><b>Status:</b> {listing.listStatus}</p>
                <button onClick={() => navigate(`/listing/${listing._id}`)} style={{marginTop: 8}}>More Info</button>
            </div>
        );
    }

    return (
        <div>
            <header className="home-header">
                <div className="home-left">
                    <a onClick={handleHome} className="logo">BHIKER Vendor</a>
                    <span className="home-decor1" />
                    <span className="home-decor2">Welcome, {user?.firstname}</span>
                </div>

                <div className="home-center">
                    <span className="home-location">📍 <Userlocation /></span>
                </div>

                <div className="home-right">
                    <img src={addIcon} alt="add icon" width={32} height={32}
                         style={{cursor: "pointer", borderRadius: "50%"}}
                         onClick={toggleAddDropdown}
                    />
                    {showAddDropdown && (
                        <div className="addmenu-drop">
                            <div className="addmenu-drop1">
                                <a onClick={handleAddListing}>Add Listing</a>
                            </div>
                            <div className="addmenu-drop1">
                                <a onClick={handleHome}>Configure Listing</a>
                            </div>
                            <div className="addmenu-drop1">
                                <a onClick={handleSettings}>Settings</a>
                            </div>
                        </div>
                    )}
                    <img src={userIcon} alt="user icon" width={32} height={32}
                         style={{cursor: "pointer", borderRadius: "50%"}}
                         onClick={toggleShowDropdown}
                    />
                    {showUserDropdown && (
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
            <div className="listings-section">
                <h2 style={{margin: "1rem 0"}}>Your Listings</h2>
                {loading ? (
                    <div>Loading…</div>
                ) : error ? (
                    <div style={{ color: "red" }}>{error}</div>
                ) : listings.length === 0 ? (
                    <div>No listings found. Click "Add Listing" to create one!</div>
                ) : (
                    <div className="listing-grid">
                        {listings.map(listing => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


export default HomePageVendor;