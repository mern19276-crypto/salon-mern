import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/OwnerFeedbackPage.css"; // reuse same styling

const OwnerFeedbackPage = () => {
  const navigate = useNavigate();
  const salon = JSON.parse(localStorage.getItem("salonUser"));
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${salon.id}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setFeedbacks(data);

        if (data.length > 0) {
          const total = data.reduce((sum, fb) => sum + fb.rating, 0);
          setAvgRating((total / data.length).toFixed(1));
        } else {
          setAvgRating(0);
        }
      } else {
        setFeedbacks([]);
        setAvgRating(0);
      }
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  useEffect(() => {
    if (salon?.id) fetchFeedbacks();
  }, [salon?.id]);

  return (
    <div className="calendar-container">
      {/* Sidebar */}
      <aside className="modern-sidebar">
        <img src={logo} alt="Brand Logo" className="modern-logo" />
        <i className="fas fa-home" title="Home" onClick={() => navigate('/dashboard')}></i>
        <i className="fas fa-calendar-alt" title="Calendar" onClick={() => navigate('/calendar')}></i>
        <i className="fas fa-smile" title="Services" onClick={() => navigate('/services')}></i>
        <i className="fas fa-comment active" title="Feedbacks" onClick={() => navigate('/feedbacks')}></i>
        <i className="fas fa-chart-bar" title="Reports"></i>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">Customer Feedbacks</h1>
            <div className="header-actions">
              
             
            </div>
          </div>
        </header>

        <div className="services-body">
          {/* Summary Panel */}
          <div className="category-panel">
            <h3 className="category-title">Summary</h3>
            <div className="category-item">
              <span>Total Feedbacks</span>
              <span>{feedbacks.length}</span>
            </div>
            <div className="category-item">
              <span>Average Rating</span>
              <span>{avgRating > 0 ? `⭐ ${avgRating}/5` : "No ratings yet"}</span>
            </div>
          </div>

          {/* Feedback List */}
          <div className="service-panel">
            <div className="service-panel-header">
              <h3>Recent Feedbacks</h3>
            </div>

            <div className="service-grid">
              {feedbacks.length === 0 ? (
                <p className="no-feedback-msg">No feedback received yet.</p>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb._id} className="service-card">
                    <div className="service-info">
                      <strong>{fb.userEmail}</strong>
                      <span className="rating-stars">
                        {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                      </span>
                    </div>
                    <div className="service-price">
                      <span>
                        {new Date(fb.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="comment">
                      {fb.comment || "(No comment provided)"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerFeedbackPage;
