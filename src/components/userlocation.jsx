navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude);
        console.log(longitude);
    },
    (error) => {
        console.error(error);
    }
);


