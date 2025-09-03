import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../css/SalonServices.css';

const SalonServices = () => {
  const navigate = useNavigate();
  const salon = JSON.parse(localStorage.getItem("salonUser"));
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '15min',
    gender: 'Unisex',
    image: '',
  });
  const [showPopup, setShowPopup] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/services/${salon.id}`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    if (salon?.id) fetchServices();
  }, [salon?.id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateDurations = () => {
    const options = [];
    for (let mins = 15; mins <= 300; mins += 5) {
      const hr = Math.floor(mins / 60);
      const min = mins % 60;
      options.push(`${hr > 0 ? hr + 'h ' : ''}${min}min`.trim());
    }
    return options;
  };

  const handleAddOrUpdate = async () => {
    if (!formData.name || !formData.price || !formData.duration) return alert("Please fill all required fields");

    try {
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService ? `http://localhost:5000/api/services/${editingService._id}` : `http://localhost:5000/api/services`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, salonId: salon.id }),
      });
      if (res.ok) {
        fetchServices();
        setShowPopup(false);
        setEditingService(null);
        setFormData({ name: '', price: '', duration: '15min', gender: 'Unisex', image: '' });
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name || '',
      price: service.price || '',
      duration: service.duration || '15min',
      gender: service.gender || 'Unisex',
      image: service.image || '',
    });
    setEditingService(service);
    setShowPopup(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="calendar-container">
      <aside className="modern-sidebar">
        <img src={logo} alt="Brand Logo" className="modern-logo" />
        <i className="fas fa-home" title="Home" onClick={() => navigate('/dashboard')}></i>
        <i className="fas fa-calendar-alt" title="Calendar" onClick={() => navigate('/calendar')}></i>
         <i className="fas fa-smile active" title="Customers" onClick={() => navigate('/services')}></i>
   <i className="fas fa-comment " title="Feedbacks" onClick={() => navigate('/feedbacks')}></i>
        <i className="fas fa-chart-bar" title="Reports"></i>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">Service</h1>
            <div className="header-actions">
              <button className="add-btn" onClick={() => {
                setFormData({ name: '', price: '', duration: '15min', gender: 'Unisex', image: '' });
                setEditingService(null);
                setShowPopup(true);
              }}>Add</button>
              
            </div>
          </div>
        </header>

        <div className="services-body">
          <div className="category-panel">
            <h3 className="category-title">Categories</h3>
            <div className="category-item">
              <span>Hair & styling</span>
              <span>{services.length}</span>
            </div>
            <div className="category-link">Add category</div>
          </div>

          <div className="service-panel">
            <div className="service-panel-header">
              <h3>Hair & styling</h3>
              
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-info">
                    <strong>{service.name}</strong>
                    <span>{service.duration}</span>
                  </div>
                  <div className="service-price">
                    <span>LKR {service.price}</span>
                    <i className="fas fa-edit edit-icon" onClick={() => handleEdit(service)}></i>
                    <i className="fas fa-trash delete-icon" onClick={() => handleDelete(service._id)}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{editingService ? 'Edit Service' : 'Add Service'}</h2>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Service Name" />
            <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price (LKR)" />
            <select name="duration" value={formData.duration} onChange={handleInputChange}>
              {generateDurations().map((d, idx) => (
                <option key={idx} value={d}>{d}</option>
              ))}
            </select>
            <select name="gender" value={formData.gender} onChange={handleInputChange}>
              <option>Unisex</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <input name="image" value={formData.image} onChange={handleInputChange} placeholder="Image URL (optional)" />
            <div className="popup-actions">
              <button className="btn-save" onClick={handleAddOrUpdate}>{editingService ? 'Update' : 'Add'} Service</button>
              <button className="btn-cancel" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonServices;
