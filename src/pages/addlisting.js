import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import userIcon from "../icons/user.png";
import addIcon from "../icons/add.png";
import placeholder from "../vehicles/addlist_placeholder.png"
import Userlocation from "../components/userlocation";
import { Dropdown } from "primereact/dropdown";
import honda_activa from "../vehicles/honda_activa.jpg";
import tvs_apache from "../vehicles/tvs_apache.jpg";
import hero_splendor from "../vehicles/hero_splendor.png";
import bajaj_pulsar from "../vehicles/bajaj_pulsar.jpg";
import suzuki_access from "../vehicles/suzuki_access.jpg";
import {SelectButton} from "primereact/selectbutton";
import {list} from "postcss";

function AddListing() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showAddDropdown, setShowAddDropdown] = useState(false);

    const [listData, setListData] = useState({
        name: "",
        type: "",
        model: "",
        frequency: "hourly",
    })

    const [vehicleImage, setVehicleImage] = useState(placeholder)
    const vehicleType = ["Scooter", "Electric Scooter", "Geared Motorcycle", "Non-Geared Motorcycle", "Electric Motorcycle", "Powered Bicycle"]
    const vehicleModel =
        [{ label: "Honda Activa", value: "honda_activa"},
        { label: "TVS Apache", value: "tvs_apache"},
        { label: "Bajaj Pulsar", value: "bajaj_pulsar"},
        { label: "Hero Splendor", value: "hero_splendor"},
        { label: "Suzuki Access", value: "suzuki_access"}]

    const modelImageMap = {
        honda_activa: honda_activa,
        tvs_apache: tvs_apache,
        hero_splendor: hero_splendor,
        bajaj_pulsar: bajaj_pulsar,
        suzuki_access: suzuki_access,
    };

    const [pincode, setPincode] = useState('');
    const [position, setPosition] = useState([13.3557, 74.7898]);

    const frequencyOptions = [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly'},
        { label: 'Monthly', value: 'monthly'},
    ]

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            alert("Please log in first.");
            navigate("/login");
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setListData({
            ...listData,
            [e.target.name] : e.target.value
        });
    }

    const handleDropdownType = (e) => {
        setListData({
            ...listData,
            type: e.value
        });
    };

    const handleDropdownModel = (e) => {
        const selectedModel = e.value
        setListData({
            ...listData,
            model: e.value
        });
        setVehicleImage(modelImageMap[selectedModel] || placeholder);
    };

    const geocodePincode = async () => {
        if (pincode.length !== 6) {
            alert("Please enter a valid 6-digit pincode");
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                alert("Pincode not found");
            }
        } catch (error) {
            alert("Failed to fetch location");
        }
    };

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

    const handleConfigListing = () => {
        navigate("/HomeVendor");
    }

    const handleHome = () => {
        navigate("/HomeVendor");
    }

    const handleSettings = () => {
        navigate("/VendorSettings");
    }

    return (
        <div className="app">
            <header className="home-header">
                <div className="home-left">
                    <a onClick={handleHome} className="logo">BHIKER Vendor</a>
                    <span className="home-decor1" />
                    <span className="home-decor2">Add Listing</span>
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
                                <a onClick={handleConfigListing}>Configure Listing</a>
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
            <div className="addproduct">
                <div className="addproduct-content">
                    <div className="addproduct-content-left">
                        <div className="addproduct-name">
                            <div className="addproduct-name-label">
                                Name
                            </div>
                            <div className="addproduct-name-input">
                                <input type="name" id="input-name" name="name" value={listData.name} onChange={handleChange} required/>
                            </div>
                        </div>
                        <img src={vehicleImage} alt="placeholder" width={512} height={512}/>
                        <div className="addproduct-type-label">
                            Type
                        </div>
                        <div className="addproduct-type">
                            <Dropdown value={listData.type}
                                      onChange={(e) => handleDropdownType(e)}
                                      options={vehicleType}
                                      optionLabel={(option) => option}
                                      optionValue={(option) => option}
                                      placeholder="Select Vehicle Type:"
                                      className="w-full md:w-14rem"
                                      checkmark={true}
                                      highlightOnSelect={false}
                                      style={{color: "red", fontWeight: "normal", border: "1px solid black", padding: "5px",
                                      borderRadius: "15px"}}
                            />
                        </div>
                        <div className="addproduct-model-label">
                            Model
                        </div>
                        <div className="addproduct-model">
                            <Dropdown value={listData.model}
                                      onChange={(e) => handleDropdownModel(e)}
                                      options={vehicleModel}
                                      editable placeholder="Select Vehicle Model:"
                                      className="w-full md:w-14rem"
                                      style={{fontWeight: "normal", border: "1px solid black", padding: "5px",
                                          borderRadius: "15px"}}
                            />
                        </div>
                    </div>
                    <div className="addproduct-content-center">
                        <div className="addproduct-content-center-top">
                            <div className="addproduct-description-label">
                                Description
                            </div>
                            <div className="addproduct-description-input">
                                <textarea id="feedback" name="user_feedback" rows="12" cols="70"></textarea>
                            </div>
                        </div>
                        <div className="addproduct-content-center-bottom">
                            <div className="addproduct-address-label">
                                Enter Pincode:
                            </div>
                            <div className="addproduct-address-input">
                                <input
                                    type="text"
                                    maxLength={6}
                                    pattern="\d{6}"
                                    title="Enter a valid 6-digit pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/, ''))}
                                    placeholder="Enter 6-digit pincode"
                                />
                            </div>
                            <div className="addproduct-address-buttons">
                                <div className="addproduct-address-fetch">
                                    <button>
                                        Fetch
                                    </button>
                                </div>
                                <div className="addproduct-address-search">
                                    <button onClick={geocodePincode}>
                                        Search
                                    </button>
                                </div>
                            </div>
                            <div className="addproduct-address-map">
                                <MapContainer center={position} zoom={13} style={{ height: "298px", width: "100%" }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={position} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                    <div className="addproduct-content-right">
                        Price Controls
                        <div className="addproduct-pricecontrols-label">
                            <div className="addproduct-price-label">
                                Set Price [₹]:
                            </div>
                            <div className="addproduct-price-input">
                                <input type="text" maxLength="4" name="price" required />
                            </div>
                        </div>
                        <div className="addproduct-pricecontrols-select">
                            <label>Choose Billing Frequency:</label>
                            <SelectButton
                                style={{marginTop: '1rem'}}
                                value={listData.frequency}
                                options={frequencyOptions}
                                onChange={(e) => setListData({ ...listData, frequency: e.value })}
                                allowEmpty={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default AddListing;