import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../index.css';

function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check if the logged-in user is an admin
  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'Admin'); // Set isAdmin to true if the role is "Admin"
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    localStorage.removeItem('role'); // Clear the role
    navigate('/'); // Redirect to Landing Page
    window.location.reload(); // Refresh to reset the app state
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>11millioncrafts</h1>
      </div>
      <nav className="header-right">
        <ul>
          <li><NavLink to="/home">Home</NavLink></li>
          <li><NavLink to="/about">About Us</NavLink></li>
          <li><NavLink to="/contact">Contact Us</NavLink></li>
          <li><NavLink to="/services">Services</NavLink></li>
          <li><NavLink to="/products">Products</NavLink></li>
          {/* Only show Form navigation if the user is an admin */}
          {isAdmin && <li><NavLink to="/form">Form</NavLink></li>}
        </ul>
      </nav>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </header>
  );
}

export default Header;
