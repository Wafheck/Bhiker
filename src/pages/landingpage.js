import React from "react";
import registerimg from "../images/register.png";
import verifyimg from "../images/verify.png";
import pickimg from "../images/pick.png";
import rideimg from "../images/ride.png";
import Register from './register.js';


function Landingpage() {
    return (
        <div>
            <header className="home-header">
                <a href="landingpage" className="logo">BHIKER</a>
                <div className="auth-button">
                    <button className="auth-btn" onClick={() => window.location.href = 'register'}>
                        SIGN IN ⚪ REGISTER
                    </button>
                </div>
            </header>

            <section className="hero">
                <h1>KNOCK KNOCK! Your freedom is here.</h1>
                <p>Bhiker is more than just a ride—it's your key to freedom, flexibility, and fun. Where will you go today?</p>
                <button className="browse-button" onClick={() => window.location.href = 'browse'}>
                    BROWSE🔍
                </button>
            </section>

            <div className="steps-body">
                <div className="steps-header">At Bhiker we keep it simple...</div>
                <section className="steps">
                    <div className="step">
                        <img src={registerimg} alt="Register"/>
                        <div className="step-title">Register</div>
                    </div>
                    <div className="step">
                        <img src={verifyimg} alt="Verify"/>
                        <div className="step-title">Verify</div>
                    </div>
                    <div className="step">
                        <img src={pickimg} alt="Pick"/>
                        <div className="step-title">Pick</div>
                    </div>
                    <div className="step">
                        <img src={rideimg} alt="Ride"/>
                        <div className="step-title">Ride</div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Landingpage;
