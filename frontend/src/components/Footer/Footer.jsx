import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-primary mb-3 fw-bold">Bytes Diet Planner</h5>
            <p className="footer-text">
              Your personalized diet planning companion. Get customized meal plans based on your preferences and goals.
            </p>
          </Col>
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3 fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link"><span className="d-md-none">🏠</span> Home</Link></li>
              <li><Link to="/profile" className="footer-link"><span className="d-md-none">📝</span> Create Plan</Link></li>
              <li><Link to="/saved-plans" className="footer-link"><span className="d-md-none">📘</span> Saved Plans</Link></li>
              <li><Link to="/about" className="footer-link"><span className="d-md-none">ℹ️</span> About</Link></li>
            </ul>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-3 fw-bold">Resources</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link"><span className="d-md-none">📚</span> Nutrition Guide</a></li>
              <li><a href="#" className="footer-link"><span className="d-md-none">🍳</span> Healthy Recipes</a></li>
              <li><a href="#" className="footer-link"><span className="d-md-none">💡</span> Diet Tips</a></li>
              <li><a href="#" className="footer-link"><span className="d-md-none">❓</span> FAQ</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="mb-3 fw-bold">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="footer-text"><span className="d-md-none">📧</span> Email: support@bytesdiet.com</li>
              <li className="footer-text"><span className="d-md-none">📞</span> Phone: (123) 456-7890</li>
            </ul>
          </Col>
        </Row>
        <hr className="footer-divider" />
        <Row className="py-3">
          <Col className="text-center">
            <small className="footer-text">© {new Date().getFullYear()} Bytes Diet Planner. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
