import React, { useState, useEffect } from "react";

const UserLocation = () => {
    const [location, setLocation] = useState("Fetching location...");

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation("Geolocation not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(latitude, longitude);

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();

                    const city =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        "Unknown City";
                    const postcode = data.address.postcode || "No postcode";

                    setLocation(`${city} ${postcode}`);
                } catch (error) {
                    console.error(error);
                    setLocation("Unable to fetch address");
                }
            },
            (error) => {
                console.error(error);
                setLocation("Permission denied or unavailable");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);
    return <span className="home-location">{location}</span>;
};

export default UserLocation;
