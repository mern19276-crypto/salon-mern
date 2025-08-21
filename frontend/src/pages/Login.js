import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import haircutImage from "../assets/hairdresser.jpg";
import "../css/Login.css";

export default function CustomerLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await fetch("http://localhost:5000/api/users/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      if (!res.ok) return alert("Failed to save user");
      const savedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(savedUser));
      navigate("/");
    } catch {
      alert("Google login failed");
    }
  };

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  const sendOtp = async () => {
    if (!phone.startsWith("+94")) {
      return alert("Use format: +94771234567");
    }
    setupRecaptcha();
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setShowOtp(true);
      alert("OTP sent");
    } catch {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const storedUser = {
        name: "OTP User",
        phone: user.phoneNumber,
        email: "",
        photoURL: "",
      };
      localStorage.setItem("user", JSON.stringify(storedUser));
      navigate("/profile");
    } catch {
      alert("Invalid OTP");
    }
  };

  const handleGuestContinue = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <h2 className="login-title1">Welcome to Salon</h2>
        <p className="login-subtext1">
          Log in to book top salon services easily and quickly.
        </p>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="google-icon"
          />
          Continue with Google
        </button>

        <div className="divider">
          <hr className="line" />
          <span className="or-text">OR</span>
          <hr className="line" />
        </div>

        <input
          type="tel"
          className="input"
          placeholder="Enter phone (+94...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {showOtp && (
          <input
            type="text"
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}
        <button
          className="continue-btn"
          onClick={showOtp ? verifyOtp : sendOtp}
        >
          {showOtp ? "Verify OTP" : "Send OTP"}
        </button>

        <button className="guest-btn" onClick={handleGuestContinue}>
          🎉 Continue as Guest
        </button>

        <div id="recaptcha-container"></div>

        <p className="business-link">
          Are you a salon owner?{" "}
          <a href="/login/business" className="sign-in-link">
            Login here
          </a>
        </p>
      </div>

      <div className="image-section">
        <img src={haircutImage} alt="Salon" className="login-image" />
      </div>
    </div>
  );
}
