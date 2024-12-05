import React from 'react';

function Home() {
  return (
    <div className='home-button'>
      <h1>Welcome to 11million Crafts!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
