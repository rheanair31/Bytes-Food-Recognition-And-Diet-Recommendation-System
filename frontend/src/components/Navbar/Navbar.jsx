import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { token, setToken } = useContext(StoreContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div id="sticky">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              <span style={{ fontSize: '2rem' }}>Bytes Diet Planner</span>
            </Link>
            
            <div className="navbar-links">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Create Plan
              </Link>
              <Link 
                to="/log-food" 
                className={`nav-link ${isActive('/log-food') ? 'active' : ''}`}
              >
                Log Food
              </Link>
              <Link 
                to="/saved-plans" 
                className={`nav-link ${isActive('/saved-plans') ? 'active' : ''}`}
              >
                Saved Plans
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Link>
            </div>

            <div className="navbar-actions">
              {!token ? (
                <button 
                  className="nav-button secondary"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              ) : (
                <div className="navbar-profile">
                  <FaUserCircle 
                    className="profile-icon"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  />
                  {showProfileDropdown && (
                    <ul className="nav-profile-dropdown">
                      <li onClick={() => navigate('/saved-plans')}>
                        <i className="fas fa-book"></i>
                        <span>Saved Plans</span>
                      </li>
                      <li onClick={() => navigate('/profile')}>
                        <i className="fas fa-user"></i>
                        <span>Profile</span>
                      </li>
                      <li onClick={() => navigate('/log-food')}>
                        <i className="fas fa-utensils"></i>
                        <span>Log Food</span>
                      </li>
                      <hr />
                      <li onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button 
              className="mobile-menu-button" 
              onClick={toggleMobileMenu}
            >
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </div>

      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="navbar-brand">
            <span>Bytes</span> Diet Planner
          </Link>
          <button 
            className="mobile-menu-button" 
            onClick={toggleMobileMenu}
          >
            <FaTimes />
          </button>
        </div>

        <div className="mobile-menu-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            Create Plan
          </Link>
          <Link 
            to="/log-food" 
            className={`nav-link ${isActive('/log-food') ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            Log Food
          </Link>
          <Link 
            to="/saved-plans" 
            className={`nav-link ${isActive('/saved-plans') ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            Saved Plans
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            About
          </Link>
        </div>

        <div className="mobile-menu-actions">
          {!token ? (
            <button 
              className="nav-button secondary"
              onClick={() => {
                setShowLogin(true);
                toggleMobileMenu();
              }}
            >
              Login
            </button>
          ) : (
            <div className="navbar-profile">
              <FaUserCircle 
                className="profile-icon"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  toggleMobileMenu();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
