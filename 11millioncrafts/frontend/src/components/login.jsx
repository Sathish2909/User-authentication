import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // Default role is User
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password, role });
      setMessage(response.data.message);
      setError(false);
      localStorage.setItem('token', response.data.token); // Save the token in localStorage
      localStorage.setItem('role', response.data.role);
      setIsLoggedIn(true); // Update login state
      navigate('/home'); // Redirect to Home
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid email, password, or role.');
      setError(true);
    }
  };

  // Function to handle report download action
  const handleDownloadReport = async () => {
    try {
      // Send GET request to the backend to fetch the report (CSV file)
      const response = await axios.get('http://localhost:5000/report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Send the token for auth
        },
        responseType: 'blob', // Important for file downloads
      });

      // Create a temporary link element to trigger the file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user_report.csv'; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
      window.URL.revokeObjectURL(url); // Free up the object URL
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to download the report. Please try again later.');
      setError(true);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit">Login</button>
        {message && (
          <p className={error ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </form>

      {/* Display the Download Report button only if the user is logged in */}
      {localStorage.getItem('token') && (
        <button onClick={handleDownloadReport}>Download Report</button>
      )}
    </div>
  );
}

export default Login;