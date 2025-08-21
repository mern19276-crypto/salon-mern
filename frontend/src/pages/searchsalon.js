import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/searchsaloon.css";
import fallbackImage from "../assets/searchsalonimg.png";
import LocationPickerModal from "./LocationPickerModal";

const districtSuggestions = [
  "Colombo", "Kandy", "Galle", "Jaffna", "Matara",
  "Kurunegala", "Anuradhapura", "Negombo", "Ratnapura",
  "Batticaloa", "Nuwara Eliya"
];

const SearchSalon = () => {
  const [allSalons, setAllSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [nearbySalons, setNearbySalons] = useState([]);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal and mode states
  const [modalOpen, setModalOpen] = useState(false);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [manualNearbyMode, setManualNearbyMode] = useState(false);

  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  // Fetch all salons and attach average ratings
  const fetchSalons = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/salons");
      let salons = await res.json();

      // Fetch average ratings for each salon
      const salonsWithRatings = await Promise.all(
        salons.map(async (salon) => {
          try {
            const fbRes = await fetch(`http://localhost:5000/api/feedback/${salon._id}`);
            const feedbacks = await fbRes.json();
            const avgRating = feedbacks.length
              ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
              : 0;
            return { ...salon, avgRating: avgRating.toFixed(1) };
          } catch (err) {
            return { ...salon, avgRating: 0 };
          }
        })
      );

      // Sort salons by average rating descending
      salonsWithRatings.sort((a, b) => b.avgRating - a.avgRating);

      setAllSalons(salonsWithRatings);
      if (!isNearbyMode) applyFilters(salonsWithRatings, query, genderFilter);
    } catch (err) {
      console.error("❌ Failed to load salons", err);
      alert("Failed to load salons");
    }
  }, [query, genderFilter, isNearbyMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchSalons();
  }, [fetchSalons]);

  // Unified filter effect
  useEffect(() => {
    if (isNearbyMode) {
      let filtered = nearbySalons;
      if (genderFilter !== "All") filtered = filtered.filter((s) => s.salonType === genderFilter);
      setFilteredSalons(filtered);
    } else {
      let filtered = allSalons;
      if (query) filtered = filtered.filter((s) => s.location.toLowerCase().includes(query.toLowerCase()));
      if (genderFilter !== "All") filtered = filtered.filter((s) => s.salonType === genderFilter);
      setFilteredSalons(filtered);
    }
  }, [genderFilter, query, allSalons, nearbySalons, isNearbyMode]);

  const applyFilters = (salons, locationQuery, gender) => {
    let filtered = salons;
    if (locationQuery) filtered = filtered.filter((s) =>
      s.location.toLowerCase().includes(locationQuery.toLowerCase())
    );
    if (gender !== "All") filtered = filtered.filter((s) => s.salonType === gender);
    setFilteredSalons(filtered);
  };

  const fetchNearbySalons = async (lat, lng, manual = false) => {
    try {
      const res = await fetch(`http://localhost:5000/api/salons/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Failed to load nearby salons");
      let data = await res.json();

      // Fetch ratings for nearby salons
      const nearbyWithRatings = await Promise.all(
        data.map(async (salon) => {
          try {
            const fbRes = await fetch(`http://localhost:5000/api/feedback/${salon._id}`);
            const feedbacks = await fbRes.json();
            const avgRating = feedbacks.length
              ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
              : 0;
            return { ...salon, avgRating: avgRating.toFixed(1) };
          } catch {
            return { ...salon, avgRating: 0 };
          }
        })
      );

      nearbyWithRatings.sort((a, b) => b.avgRating - a.avgRating);

      setNearbySalons(nearbyWithRatings);
      setIsNearbyMode(true);
      setManualNearbyMode(manual);
      setQuery("");
      setShowSuggestions(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Auto fetch nearest salons on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchNearbySalons(latitude, longitude, false);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable.", err);
        }
      );
    }
  }, []);

  const handleLocationInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    if (manualNearbyMode || isNearbyMode) {
      setManualNearbyMode(false);
      setIsNearbyMode(false);
      setNearbySalons([]);
    }
  };

  const handleLocationSelect = (position) => {
    fetchNearbySalons(position.lat, position.lng, true);
    setModalOpen(false);
  };

  const openNearbyModal = () => setModalOpen(true);
  const closeNearbyModal = () => setModalOpen(false);

  const resetNearbyFilter = () => {
    setManualNearbyMode(false);
    setIsNearbyMode(false);
    setNearbySalons([]);
    applyFilters(allSalons, query, genderFilter);
  };

  const renderStars = (rating) => {
    return (
      <>
        {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      </>
    );
  };

  return (
    <div className="search-wrapper">
      <header className="navbar">
        <div className="logo logo-lowered" onClick={() => navigate("/")}>Mobitel Salon</div>
        <nav className="nav-menu">
          <button className="nav-btn-light" onClick={() => navigate("/business")}>For Business</button>
          {!user ? (
            <>
              <button className="nav-link" onClick={() => navigate("/login")}>Log In</button>
              <div className="menu-container">
                <button className="nav-menu-btn" onClick={toggleMenu}>☰</button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <ul>
                      <li>For Customers</li>
                      <li onClick={() => navigate("/login")}>Login or Sign Up</li>
                      <li>Download the App</li>
                      <li>Help & Support</li>
                      <li>සිංහල</li>
                      <li className="dropdown-divider"></li>
                      <li>For Business →</li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="menu-container profile-warp">
              <img
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt="Profile"
                className="profile-icon"
                onClick={toggleMenu}
              />
              {menuOpen && (
                <div className="dropdown-menu">
                  <div className="user-name">{user.name}</div>
                  <ul>
                    <li onClick={() => navigate("/profile")}>👤 Profile</li>
                    <li onClick={() => navigate("/appointments")}>📅 Appointments</li>
                    <li onClick={handleLogout}>🚪 Logout</li>
                    <li className="dropdown-divider"></li>
                    <li>Download the App</li>
                    <li>Help & Support</li>
                    <li>සිංහල</li>
                    <li className="dropdown-divider"></li>
                    <li>For Business →</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <div className="search-bar">
        <div className="location-search">
          <input
            type="text"
            placeholder="Search location (e.g. Colombo)"
            className="location-input"
            value={query}
            onChange={handleLocationInputChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => setShowSuggestions(true)}
            disabled={manualNearbyMode}
          />
          {showSuggestions && query && !manualNearbyMode && (
            <ul className="suggestion-list">
              {districtSuggestions
                .filter((d) => d.toLowerCase().startsWith(query.toLowerCase()))
                .map((d) => (
                  <li key={d} onClick={() => {
                    setQuery(d);
                    setShowSuggestions(false);
                    if (manualNearbyMode) {
                      setManualNearbyMode(false);
                      setIsNearbyMode(false);
                      setNearbySalons([]);
                    }
                  }}>
                    {d}
                  </li>
                ))}
            </ul>
          )}
        </div>
        <button className="btn btn-nearby" onClick={openNearbyModal} disabled={modalOpen}>
          Find Nearest Salon
        </button>
        {manualNearbyMode && (
          <button className="btn btn-reset" onClick={resetNearbyFilter} title="Reset location filter">
            ✕ Reset Nearby Filter
          </button>
        )}
      </div>

      <div className="gender-switch-container">
        {[
          { type: "All", icon: "🌐" },
          { type: "Male", icon: "👨" },
          { type: "Female", icon: "👩" },
          { type: "Unisex", icon: "🧑‍🤝‍🧑" },
        ].map(({ type, icon }) => (
          <label
            key={type}
            className={`switch-option ${genderFilter === type ? "active" : ""}`}
            onClick={() => setGenderFilter(type)}
          >
            <span className="icon-label">{icon}</span> {type}
          </label>
        ))}
      </div>

      {isNearbyMode && filteredSalons.length > 0 && (
        <>
          <h2 className="section-title">Recommended Salons</h2>
          <div className="salon-grid">
            {filteredSalons.map((salon) => (
              <div className="salon-card" key={salon._id}>
                <img src={salon.image || fallbackImage} alt={salon.name} className="salon-image" />
                <div className="salon-info">
                  <h4>{salon.name}</h4>
                  <p>{salon.location}</p>
                  <p><strong>{salon.salonType}</strong> salon</p>
                  <p className="rating-stars">
  {Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < salon.avgRating ? "" : "empty-star"}
    >
      ★
    </span>
  ))}
  <span> ({salon.avgRating})</span>
</p>

                  <button className="select-btn" onClick={() =>
                    navigate(`/select-services/${salon._id}`, { state: { salon } })
                  }>
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">All Salons</h2>
      <div className="salon-grid">
        {allSalons.map((salon) => (
          <div className="salon-card" key={salon._id}>
            <img src={salon.image || fallbackImage} alt={salon.name} className="salon-image" />
            <div className="salon-info">
              <h4>{salon.name}</h4>
              <p>{salon.location}</p>
              <p><strong>{salon.salonType}</strong> salon</p>
              <p className="rating-stars">
  {Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < salon.avgRating ? "" : "empty-star"}
    >
      ★
    </span>
  ))}
  <span> ({salon.avgRating})</span>
</p>
              <button className="select-btn" onClick={() =>
                navigate(`/select-services/${salon._id}`, { state: { salon } })
              }>
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      <LocationPickerModal
        isOpen={modalOpen}
        onClose={closeNearbyModal}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};

export default SearchSalon;
