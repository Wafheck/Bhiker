import React, { createContext, useState, useEffect } from "react";

// Create context with default values
const LocationContext = createContext({
    postcode: "",
    city: "",
    loading: true,
    error: null,
});

export const LocationProvider = ({ children }) => {
    const [postcode, setPostcode] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If geolocation not supported
        if (!navigator.geolocation) {
            setError("Geolocation not supported.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();

                    const cityName =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        "Unknown City";

                    setCity(cityName);
                    setPostcode(data.address.postcode || "");
                    setLoading(false);
                } catch (err) {
                    setError("Unable to fetch address");
                    setLoading(false);
                }
            },
            (err) => {
                setError("Permission denied or unavailable");
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    return (
        <LocationContext.Provider value={{ postcode, city, loading, error }}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;
