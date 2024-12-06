import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
function Home() {
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('role');
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

