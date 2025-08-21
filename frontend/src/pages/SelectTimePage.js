import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/SelectTimePage.css";
import {
  timeStringToMinutes,
  filterMatchingSlots,
} from "../utils/slotUtils";

const SelectTimePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedServices =
    location.state?.selectedServices ||
    JSON.parse(localStorage.getItem("selectedServices")) || [];

  const selectedProfessional =
    location.state?.selectedProfessional ||
    JSON.parse(localStorage.getItem("selectedProfessional")) || null;

  const salon =
    location.state?.salon ||
    JSON.parse(localStorage.getItem("selectedSalon")) || null;

  const user = JSON.parse(localStorage.getItem("user"));

  const [phone, setPhone] = useState(user?.phone || "");
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedTimes, setSelectedTimes] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const generateNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        fullDate: date.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const dates = generateNext7Days();

  const fetchTimeSlots = async (proId, date) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/timeslots?professionalId=${proId}&date=${date}`
      );
      const data = await res.json();
      setAvailableSlots((prev) => ({ ...prev, [proId]: data }));
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setAvailableSlots((prev) => ({ ...prev, [proId]: [] }));
    }
  };

  useEffect(() => {
    if (!selectedProfessional || selectedServices.length === 0) return;
    const currentService = selectedServices[currentServiceIndex];
    const pro = selectedProfessional._id
      ? selectedProfessional
      : selectedProfessional[currentService.name];
    const firstDate = dates[0].fullDate;
    setSelectedDates((prev) => ({ ...prev, [currentService.name]: firstDate }));
    fetchTimeSlots(pro?._id, firstDate);
  }, [currentServiceIndex, selectedProfessional]);

  const handleDateClick = (key, proId, fullDate) => {
    setSelectedDates((prev) => ({ ...prev, [key]: fullDate }));
    setSelectedTimes((prev) => ({ ...prev, [key]: null }));
    fetchTimeSlots(proId, fullDate);
  };

  const handleTimeClick = (key, slotId, isBooked) => {
    if (isBooked) return;
    setSelectedTimes((prev) => ({ ...prev, [key]: slotId }));
  };

  const handleContinue = () => {
    const currentService = selectedServices[currentServiceIndex];
    const key = currentService.name;
    if (!selectedTimes[key]) {
      alert("❌ Please select a time for the current service.");
      return;
    }
    setShowPopup(true);
  };

  const handleConfirmBooking = async () => {
    const currentService = selectedServices[currentServiceIndex];
    const pro = selectedProfessional._id
      ? selectedProfessional
      : selectedProfessional[currentService.name];
    const key = currentService.name;
    const slotId = selectedTimes[key];
    const date = selectedDates[key];
    const slotList = filterMatchingSlots(
      availableSlots[pro?._id] || [],
      currentService.duration
    );
    const timeObj = slotList.find((slot) => slot._id === slotId);

    const appointment = {
      phone,
      email: user?.email || "",
      name: user?.name || "Guest",
      appointments: [
        {
          serviceName: currentService.name,
          price: currentService.price,
          duration: currentService.duration,
          date,
          startTime: timeObj?.startTime,
          endTime: timeObj?.endTime,
          professionalId: pro?._id,
          salonId: salon?._id,
        },
      ],
    };

    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      const data = await res.json();
      if (data.success) {
        setShowPopup(false);
        if (currentServiceIndex + 1 < selectedServices.length) {
          setCurrentServiceIndex(currentServiceIndex + 1);
        } else {
          alert("✅ All appointments booked successfully!");
          navigate("/appointments");
        }
      } else {
        alert("❌ Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    }
  };

  const currentService = selectedServices[currentServiceIndex];
  const pro = selectedProfessional._id
    ? selectedProfessional
    : selectedProfessional[currentService.name];
  const key = currentService.name;
  const slots = availableSlots[pro?._id] || [];
  const filtered = filterMatchingSlots(slots, currentService.duration);

  return (
    <div className="select-services-container">
      <div className="left-column">
        <p className="breadcrumb">
          Services &gt; Professional &gt; <b>Time</b> &gt; Confirm
        </p>
        <h2 className="heading-with-search">Select Time for {currentService.name}</h2>

        <div className="date-buttons">
          {dates.map((day) => (
            <button
              key={day.fullDate}
              className={`date-button ${
                selectedDates[key] === day.fullDate ? "selected" : ""
              }`}
              onClick={() => handleDateClick(key, pro?._id, day.fullDate)}
            >
              <span>{day.date}</span>
              <small>{day.day}</small>
            </button>
          ))}
        </div>

        <div className="services-list">
          {filtered.length === 0 ? (
            <p>No matching slots</p>
          ) : (
            filtered.map((slot) => {
              const isSelected = selectedTimes[key] === slot._id;
              const isBooked = slot.isBooked;

              return (
                <div
                  key={slot._id}
                  className={`service-card ${
                    isBooked ? "disabled" : isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleTimeClick(key, slot._id, isBooked)}
                  style={{ pointerEvents: isBooked ? "none" : "auto" }}
                >
                  <p>
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <p>{isBooked ? "❌ Booked" : `LKR ${currentService.price}`}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="right-column">
        <div className="summary-box">
          <img
            src={salon?.image || "https://via.placeholder.com/200"}
            alt="Salon"
            className="salon-image"
          />
          <div className="salon-info">
            <h4>{salon?.name}</h4>
            <p>{salon?.location}</p>
            <p>💇 {currentService.name}</p>
            <p>👤 {pro?.name || "Any"}</p>
            {selectedTimes[key] && (
              <p>
                📅 {new Date(selectedDates[key]).toDateString()} 🕒{
                  filtered.find((s) => s._id === selectedTimes[key])?.startTime
                } - {
                  filtered.find((s) => s._id === selectedTimes[key])?.endTime
                }
              </p>
            )}
            <div className="total-section">
              <p>Total</p>
              <p><strong>LKR {currentService.price}</strong></p>
            </div>
          </div>
          <button className="continue-button" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <p>Enter your phone number to confirm the booking:</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="Enter your phone"
            />
            <button className="continue-button" onClick={handleConfirmBooking}>
              Confirm Booking
            </button>
            <button
              className="cancel-button"
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectTimePage;
