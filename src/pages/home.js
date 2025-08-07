import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import userIcon from "../icons/user.png";
import Userlocation from "../components/userlocation";

function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            alert("Please log in first.");
            navigate("/login");
        } else {
            setUser(storedUser)
        }
    }, [navigate]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        alert("Attempt to logout")
        navigate("/landingpage");
    }

    return (
        <div>
            <header className="home-header">
                <div className="home-left">
                    <a href="/" className="logo">BHIKER</a>
                    <span className="home-decor1" />
                    <span className="home-decor2">Welcome, {user?.firstname}</span>
                </div>

                <div className="home-center">
                    <input type="search" id="search" name="search" className="home-input" placeholder="search anything..."/>
                    <span className="home-location">📍 <Userlocation /></span>
                </div>

                <div className="home-right">
                    <img src={userIcon} alt="user icon" width={32} height={32}
                    style={{cursor: "pointer", borderRadius: "50%"}}
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
            <div className="warning">
                <h1>Work-in-progess<br />Coming soon!</h1>
            </div>
        </div>
    );
}


export default HomePage;