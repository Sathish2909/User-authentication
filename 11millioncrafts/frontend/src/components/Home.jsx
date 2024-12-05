import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has visited the home page before
    const hasVisited = sessionStorage.getItem('hasVisitedHome');

    if (!hasVisited) {
      // If not, save to sessionStorage to remember the visit
      sessionStorage.setItem('hasVisitedHome', 'true');
    } else {
      // Prevent unwanted navigation to / on reload or if visited before
      // You can add any custom logic here to prevent navigation
      console.log('You have visited this page before!');
    }
  }, []);

  return (
    <div className="home-button">
      <h1>Welcome to 11million Crafts!</h1>
    </div>
  );
}

export default Home;
