import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
function Home() {
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    localStorage.removeItem('role'); // Clear the role
    navigate('/'); // Redirect to Landing Page
    window.location.reload(); // Refresh to reset the app state
  };
  return (
    <div className="page-content">
      <h2>Welcome to 11millioncrafts!</h2>
      <p>Your one-stop solution for corporate gifting needs.</p>
      <button className="logout-button" onClick={handleLogout}>logout</button>
    </div>
    
  );
}

export default Home;
