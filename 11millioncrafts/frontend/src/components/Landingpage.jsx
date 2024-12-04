import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h2>Welcome to 11million Crafts</h2>
      <div className="button-group">
        <button onClick={() => navigate('/signup')}>New User</button>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );
}

export default LandingPage;
