import React from "react";
import Loadgif from "../images/loading.gif"

function Browse() {
    return (
        <body className="browse-body">
            <div>
            <section>
                <div className="browse-load">
                    <img src={Loadgif}/>
                    <h1>📍 Locating Rides Near You</h1>
                </div>
            </section>
            </div>
        </body>
    );
}

export default Browse;