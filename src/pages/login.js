import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import regbg from "../images/login-bg.png";
import axios from 'axios';

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('${process.env.REACT_APP_API_URL}/api/auth/login', {
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem("token", response.data.token);

            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/home");
        }  catch(error) {
            console.error('Login Failed:', error.response?.data || error.message);
            alert("Login failed: " + (error.response?.data?.message || "Invalid credentials"));
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
