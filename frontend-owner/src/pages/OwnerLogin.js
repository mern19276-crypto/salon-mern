import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/OwnerLogin.css";
import loginImage from "../assets/login-image.jpg";
import logo from "../assets/logo.png";
import axios from "axios";

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/salons/login", formData);
      localStorage.setItem("salonUser", JSON.stringify(res.data.salon));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="owner-login-container">
      <div className="owner-login-left">
        <div className="owner-logo-bar">
          
        </div>

        <h2 className="owner-login-title">Login to Your Salon</h2>
        <p className="owner-login-subtitle">Manage appointments & services</p>

        <form className="owner-login-form" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="owner-login-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="owner-login-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p style={{ color: "red", marginTop: "-10px" }}>{error}</p>}
          <button type="submit" className="owner-login-button">
            Login
          </button>
        </form>

        <p className="owner-redirect-text">
          Not registered yet? <a href="/register" className="owner-redirect-link">Register here</a>
        </p>
      </div>

      <div className="owner-login-right">
        <img src={loginImage} alt="Salon" className="owner-login-image" />
      </div>
    </div>
  );
};

export default OwnerLogin;
