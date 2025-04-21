import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { FaUtensils, FaChartLine, FaBrain, FaCamera, FaHeart, FaLeaf, FaSeedling, FaUserFriends, FaSave } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { setShowLogin } = useContext(StoreContext);

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="main-heading">Your Personalized Diet Journey</h1>
        <p className="tagline">Discover the perfect meal plan tailored just for you</p>
        <div className="cta-buttons">
          <button onClick={handleGetStarted} className="primary-button">Get Started</button>
          <Link to="/about" className="secondary-button">Learn More</Link>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <FaBrain className="feature-icon" />
          <h3>AI-Powered Plans</h3>
          <p>Smart meal recommendations tailored to your unique preferences and dietary needs</p>
        </div>
        
        <div className="feature-card">
          <FaChartLine className="feature-icon" />
          <h3>Progress Tracking</h3>
          <p>Monitor your nutrition goals and track your journey with detailed insights</p>
        </div>
        
        <div className="feature-card">
          <FaUtensils className="feature-icon" />
          <h3>Diverse Cuisines</h3>
          <p>Choose from a wide variety of cuisines for each meal of your day</p>
        </div>

        <div className="feature-card">
          <FaCamera className="feature-icon" />
          <h3>Food Logging</h3>
          <p>Easily log your meals with photo uploads and get instant nutritional analysis</p>
        </div>

        <div className="feature-card">
          <FaHeart className="feature-icon" />
          <h3>Health Goals</h3>
          <p>Set and achieve your health objectives with personalized goal tracking</p>
        </div>

        <div className="feature-card">
          <FaLeaf className="feature-icon" />
          <h3>Diet Preferences</h3>
          <p>Support for various diet types including vegetarian, vegan, and more</p>
        </div>

        <div className="feature-card">
          <FaSeedling className="feature-icon" />
          <h3>Allergy Friendly</h3>
          <p>Safely manage food allergies and dietary restrictions in your meal plans</p>
        </div>

        <div className="feature-card">
          <FaSave className="feature-icon" />
          <h3>Save & Share</h3>
          <p>Save your favorite meal plans and share them with friends and family</p>
        </div>

        <div className="feature-card">
          <FaUserFriends className="feature-icon" />
          <h3>Expert Support</h3>
          <p>Access nutrition expertise and community support for your journey</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
