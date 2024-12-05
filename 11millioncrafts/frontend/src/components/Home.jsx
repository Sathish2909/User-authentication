import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      // Send a POST request to the backend to log the logout action
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // If logout is successful, clear the token and navigate to login
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setMessage('Logout failed. Please try again later.');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('http://localhost:5000/report', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate the report');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user_report.csv'; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to download the report. Please try again later.');
    }
  };

  return (
    <div className="home-button">
      <h1>Welcome to 11million Crafts!</h1>
      
      {/* Display the report button */}
      <button onClick={handleDownloadReport}>Download Report</button>

      {/* Logout Button */}
      {isLoggedIn && (
        <button onClick={handleLogout}>Logout</button>
      )}

      {/* Display message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Home;
