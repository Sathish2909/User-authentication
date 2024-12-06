import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is admin
  const [loading, setLoading] = useState(false); // Track loading state for logout
  const [message, setMessage] = useState(''); // Display error or success messages

  // Check login status and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'Admin'); // Check if the user is an admin
    } else {
      setIsLoggedIn(false);
      navigate('/'); // Redirect to login page if not logged in
    }
  }, [navigate]);

  // Handle Logout
  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }

    try {
      setLoading(true); // Start loading
      await axios.post('http://localhost:5000/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });

      // Clear storage and reset state
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setIsLoggedIn(false);
      setLoading(false);
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
      setMessage('Logout failed. Please try again later.');
      setLoading(false);
    }
  };

  // Handle Report Download
  const handleDownloadReport = async () => {
    try {
      if (!isAdmin) {
        alert('Only admins can download the report.');
        return;
      }

      const response = await axios.get('http://localhost:5000/report', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
        },
        responseType: 'blob', // Important for file downloads
      });

      // Generate a downloadable file link
      const file = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'login_logout_report.csv'; // File name
      link.click();
      URL.revokeObjectURL(link.href); // Cleanup
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download the report. Please try again later.');
    }
  };

  return (
    <div className="page-content">
      <h2>Welcome to 11millioncrafts!</h2>
      <p>Your one-stop solution for corporate gifting needs.</p>

      {/* Show Download Report button if logged in as Admin */}
      {isAdmin && (
        <button className="download-report-button" onClick={handleDownloadReport}>
          Download Report
        </button>
      )}

      {/* Show Logout button */}
      {isLoggedIn && (
        <button className="logout-button" onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      )}

      {/* Display messages */}
      {message && <p className="error-message">{message}</p>}
    </div>
  );
}

export default Home;
