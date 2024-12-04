import { useNavigate } from 'react-router-dom';
import React from 'react';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className='home-button'>
      <h1>Welcome to 11million Crafts!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
