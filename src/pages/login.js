import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import regbg from "../images/login-bg.png";

function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (
            storedUser && storedUser.email === formData.email && storedUser.password === formData.password
        ) {
            navigate("/home");
        } else {
            alert("Invalid Credentials!");
        }
    };

    return (
        <div>
            <header className="register-header">
                <a href="landingpage" className="logo">BHIKER</a>
                <span className="reg-decor1"></span>
                <span className="reg-decor2">Login</span>
            </header>
            <div className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="form-email">
                            <label htmlFor="email">Email:</label>
                            <div className="email-enter">
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-password">
                            <label htmlFor="password">Password:</label>
                            <div className="password-enter">
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="submit-button">
                            <button type="submit" className="register-button">Login</button>
                        </div>
                        <div className="login-link">
                            <p>Don't have an account yet? <a href='register'>Register here</a></p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
