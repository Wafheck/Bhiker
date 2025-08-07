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

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            alert("Please log in first.");
            navigate("/login");
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

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
                                <a onClick={handleAddListing}>Configure Listing</a>
                            </div>
                            <div className="addmenu-drop1">
                                <a onClick={handleAddListing}>Settings</a>
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
            <div className="warning">
            </div>
        </div>
    );
}


export default HomePageVendor;