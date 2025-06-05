import React, { useState } from "react";
import regbg from "../images/login-bg.png";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import axios from 'axios';

function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Save to localStorage only after validation
        const user = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password,
        };

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', user);

            alert("Registration Successful!");
            navigate("/login");

        } catch (error) {
            console.error("Registration failed", error.response?.data || error.message);
            alert("Registration failed: " + (error.response?.data?.message || "Server Error"));
        }
    };


    return (
        <div>
            <header className="register-header">
                <a href="landingpage" className="logo">BHIKER</a>
                <span className="reg-decor1"></span>
                <span className="reg-decor2">Registration</span>
            </header>
            <div className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="form-firstname">
                            <label htmlFor="firstname">First Name:</label>
                            <div className="firstname-icon">
                                <input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-lastname">
                            <label htmlFor="lastname">Last Name:</label>
                            <div className="lastname-icon">
                                <input type="text" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} required />
                            </div>
                        </div>
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
                        <div className="form-confirm-password">
                            <label htmlFor="confirm-password">Confirm Password:</label>
                            <div className="confirm-password-enter">
                                <input type="password" id="confirm-password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="submit-button">
                            <button type="submit" className="register-button">Register</button>
                        </div>
                        <div className="login-link">
                            <p>
                                Already have an account? <a href='login'>Login here</a>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
