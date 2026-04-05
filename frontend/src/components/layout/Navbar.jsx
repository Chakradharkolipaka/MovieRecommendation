import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark glass-nav px-3 mb-3">
      <Link className="navbar-brand text-primary fw-bold" to="/">
        🎬 CineMatch AI
      </Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
        <span className="navbar-toggler-icon" />
      </button>
      <div id="nav" className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto gap-lg-2">
          {['/', '/recommend', '/explore', '/analytics'].map((path) => (
            <li className="nav-item" key={path}>
              <NavLink
                to={path}
                className={({ isActive }) => `nav-link ${isActive ? 'text-primary' : ''}`}
              >
                {path === '/' ? 'Home' : path.slice(1)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
