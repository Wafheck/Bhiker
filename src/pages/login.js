import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectButton } from 'primereact/selectbutton';
import regbg from "../images/login-bg.png";
import axios from 'axios';

function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "user"
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const roleOptions = [
        { label: 'User', value: 'user' },
        { label: 'Vendor', value: 'vendor' }
    ];

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            localStorage.setItem("token", response.data.token);

            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (formData.role == 'user'){
                navigate("/home");
            }
            else {
                navigate("/homevendor");
            }
        }  catch(error) {
            setIsSubmitting(false);
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
                        <div className="form-selectbutton">
                            <label>{formData.role} login</label>
                            <SelectButton
                                style={{marginTop: '1rem'}}
                                value={formData.role}
                                options={roleOptions}
                                onChange={(e) => setFormData({ ...formData, role: e.value })}
                                allowEmpty={false}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-email">
                            <label htmlFor="email">Email:</label>
                            <div className="email-enter">
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} required />
                            </div>
                        </div>
                        <div className="form-password">
                            <label htmlFor="password">Password:</label>
                            <div className="password-enter">
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} disabled={isSubmitting} required />
                            </div>
                        </div>
                        <div className="submit-button">
                            <button type="submit" className="register-button" disabled={isSubmitting}>Login</button>
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
