import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // Default role is User
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    try {
      // Send signup request to the backend
      const response = await axios.post('http://localhost:5000/register', { email, password, role });
      setMessage(response.data.message);
      setError(false);

      // Redirect to login after successful registration
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Signup Error:', error.response?.data || error.message); // Debugging
      setMessage(error.response?.data?.message || 'An error occurred.');
      setError(true);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSignup}>
        <h2>Sign Up</h2>
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
        <button type="submit">Register</button>
        {message && (
          <p className={error ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Signup;
