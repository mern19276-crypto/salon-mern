import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/BusinessSetupWizard.css';
import maleFemaleImage from '../assets/male-female.png';
import manIcon from '../assets/man_icon.png';
import womenIcon from '../assets/women_icon.png';

const BusinessSetupWizard = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleContinue = async () => {
    if (step === 1 && businessName.trim()) {
      setStep(2);
    } else if (step === 2 && selectedService) {
      setStep(3);
    } else if (step === 3 && locationAddress.trim()) {
      const step1Data = JSON.parse(localStorage.getItem("salonRegisterData"));

      const finalData = {
        name: businessName,
        email: step1Data.email,
        password: step1Data.password,
        phone: step1Data.phone,
        workingHours: step1Data.workingHours,
        location: locationAddress,
        services: [selectedService],
        salonType: selectedService,
        image: "", // optional, empty for now
        coordinates: {
          lat: null,
          lng: null,
        },
      };

      try {
        const res = await fetch("http://localhost:5000/api/salons/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });

        const data = await res.json();

        if (res.ok) {
          alert("🎉 Salon registered successfully!");
          localStorage.removeItem("salonRegisterData");
          navigate("/");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Registration error:", err);
        alert("Server error. Try again later.");
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="header-text">Account setup</div>
            <h1 className="main-title">What's your business name?</h1>
            <div className="input-section">
              <label className="input-label">Business name</label>
              <input
                type="text"
                className="business-input"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="header-text">Account setup</div>
            <h1 className="main-title">What services do you offer?</h1>
            <div className="services-grid">
              <div
                className={`service-card ${selectedService === 'both' ? 'selected' : ''}`}
                onClick={() => setSelectedService('both')}
              >
                <img src={maleFemaleImage} alt="Both" className="service-image" />
                <div className="service-label">Both</div>
              </div>
              <div
                className={`service-card ${selectedService === 'male' ? 'selected' : ''}`}
                onClick={() => setSelectedService('male')}
              >
                <img src={manIcon} alt="Male" className="service-image" />
                <div className="service-label">Male</div>
              </div>
              <div
                className={`service-card ${selectedService === 'female' ? 'selected' : ''}`}
                onClick={() => setSelectedService('female')}
              >
                <img src={womenIcon} alt="Female" className="service-image" />
                <div className="service-label">Female</div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="header-text">Account setup</div>
            <h1 className="main-title">Set your location address</h1>
            <div className="input-section">
              <label className="input-label">Where's your business located?</label>
              <div className="input-wrapper">
                <div className="location-icon">📍</div>
                <input
                  type="text"
                  className="location-input"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Enter your business address"
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`progress-segment ${s <= step ? 'active' : ''}`}
            ></div>
          ))}
        </div>

        <div className="wizard-nav-buttons">
          {step > 1 && (
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
          )}
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={
              (step === 1 && !businessName.trim()) ||
              (step === 2 && !selectedService) ||
              (step === 3 && !locationAddress.trim())
            }
          >
            {step === 3 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>

      <div className="content-wrapper">{renderStepContent()}</div>
    </div>
  );
};

export default BusinessSetupWizard;
