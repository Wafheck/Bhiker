import React, { useContext } from "react";
import LocationContext from "../context/locationcontext";

const UserLocation = () => {
    const { city, postcode, loading, error } = useContext(LocationContext);

    if (loading) return <span>Fetching location...</span>;
    if (error) return <span>{error}</span>;

    return (
        <span className="home-location">
      {city} {postcode}
    </span>
    );
};

export default UserLocation;
