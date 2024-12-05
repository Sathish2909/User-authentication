import { NavLink } from 'react-router-dom';
import '../index.css';
import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1>11millioncrafts</h1>
      </div>
      <nav className="header-right">
        <ul>
          <li><NavLink to="/home" activeClassName="active" exact>Home</NavLink></li>
          <li><NavLink to="/about" activeClassName="active">About Us</NavLink></li>
          <li><NavLink to="/contact" activeClassName="active">Contact Us</NavLink></li>
          <li><NavLink to="/services" activeClassName="active">Services</NavLink></li>
          <li><NavLink to="/products" activeClassName="active">Products</NavLink></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
