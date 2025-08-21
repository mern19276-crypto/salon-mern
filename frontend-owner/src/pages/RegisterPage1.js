import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/RegisterPage1.css";
import loginImage from "../assets/login-image.jpg";

const RegisterPage1 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    workingHours: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Save to local storage for step 2
    localStorage.setItem("salonRegisterData", JSON.stringify(formData));
    navigate("/register-step-2");
  };

  return (
    <div className="register1-container">
      <div className="register1-left">
        <h2 className="register1-title">Create Your Salon Account</h2>
        <p className="register1-subtitle">
          Step 1: Set up your account to manage bookings and services.
        </p>

        <form className="register1-form" onSubmit={handleNext}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="register1-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="register1-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="register1-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="register1-input"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="workingHours"
            placeholder="Working Hours (e.g. 9am - 6pm)"
            className="register1-input"
            value={formData.workingHours}
            onChange={handleChange}
            required
          />
          <button type="submit" className="register1-button">
            Next ➡️
          </button>
        </form>

        <p className="register1-footer">
          Already have an account?{" "}
          <a href="/login" className="register1-link">Login here</a>
        </p>
      </div>

      <div className="register1-right">
        <img src={loginImage} alt="Salon" className="register1-image" />
      </div>
    </div>
  );
};

export default RegisterPage1;
