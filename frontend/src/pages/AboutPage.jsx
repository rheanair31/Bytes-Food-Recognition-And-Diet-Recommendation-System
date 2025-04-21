import React from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';
import { FaCalculator, FaUtensils, FaLeaf, FaGlobe, FaCloudSun, FaSave, FaFlask, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './AboutPage.css';

const AboutPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="about-page container py-5">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="text-center mb-5"
      >
        <h1 className="display-4 mb-3">About Our Diet Recommendation System</h1>
        <p className="lead text-muted">Personalized nutrition powered by advanced algorithms</p>
      </motion.div>
      
      <Row className="equal-height-row">
        <Col lg={8} className="d-flex">
          <motion.div variants={fadeIn} className="w-100">
            <Card className="about-card">
              <Card.Body>
                <h3 className="section-title">Our Approach</h3>
                <div className="approach-content">
                  <p className="section-description">
                    The Diet Recommendation System uses cutting-edge machine learning to analyze your unique profile and create customized meal plans that work for you.
                  </p>
                  
                  <div className="approach-features">
                    {[
                      { icon: <FaCalculator className="text-primary" />, text: 'Personalized Calculations' },
                      { icon: <FaChartLine className="text-success" />, text: 'Data-Driven Insights' },
                      { icon: <FaFlask className="text-info" />, text: 'Scientific Approach' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="approach-feature"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <h5 className="mb-3">We Consider:</h5>
                  <ul className="feature-list">
                    {[
                      'Your body measurements and activity level',
                      'Personalized goals (weight loss, maintenance, or gain)',
                      'Dietary preferences and restrictions',
                      'Seasonal availability of foods',
                      'Cuisine preferences for each meal type',
                      'Food allergies and sensitivities'
                    ].map((item, index) => (
                      <li key={index} className="feature-list-item">
                        <FaLeaf className="text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col lg={4} className="d-flex">
          <motion.div variants={fadeIn} className="w-100">
            <Card className="about-card">
              <Card.Body>
                <h4 className="section-title">Key Features</h4>
                <ul className="feature-list">
                  {[
                    { icon: <FaCalculator />, text: 'Personalized calorie & macro calculations' },
                    { icon: <FaUtensils />, text: 'Multiple meal options for each time of day' },
                    { icon: <FaLeaf />, text: 'Support for various diet types' },
                    { icon: <FaGlobe />, text: 'International cuisine options' },
                    { icon: <FaCloudSun />, text: 'Seasonal food recommendations' },
                    { icon: <FaSave />, text: 'Save and manage your meal plans' }
                  ].map((item, index) => (
                    <li key={index} className="feature-list-item">
                      <div className="feature-icon">
                        {item.icon}
                      </div>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
      
      <motion.div variants={fadeIn}>
        <Card className="shadow-sm border-0 rounded-4 mb-5">
          <Card.Body className="p-4">
            <h3 className="mb-4">How It Works</h3>
            <Row>
              {[
                {
                  number: '1',
                  title: 'Create Your Profile',
                  description: 'Enter your body metrics, activity level, dietary preferences, and goals.'
                },
                {
                  number: '2',
                  title: 'Get Recommendations',
                  description: 'Our system analyzes your data and generates personalized meal plans.'
                },
                {
                  number: '3',
                  title: 'Track & Adjust',
                  description: 'Save your meal plans, track your progress, and adjust as needed.'
                }
              ].map((step, index) => (
                <Col md={4} key={index} className="text-center mb-4">
                  <motion.div
                    className="step-circle mb-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.number}
                  </motion.div>
                  <h5 className="mb-2">{step.title}</h5>
                  <p className="text-muted">{step.description}</p>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
      
      <motion.div variants={fadeIn}>
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Header className="bg-transparent border-0 p-4">
            <h3 className="mb-0">The Science Behind Our Recommendations</h3>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <div className="mb-4">
                  <h5 className="mb-3">BMR Calculation</h5>
                  <p>
                    We use the Mifflin-St Jeor Equation to calculate your Basal Metabolic Rate (BMR),
                    which is the number of calories your body needs to maintain basic functions at rest.
                  </p>
                  <div className="formula-box p-3 bg-light rounded-3">
                    <p className="mb-2"><strong>For men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5</p>
                    <p className="mb-0"><strong>For women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-4">
                  <h5 className="mb-3">Macronutrient Distribution</h5>
                  <p>
                    Our system recommends an optimal balance of macronutrients based on your goals:
                  </p>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 py-2">
                      <strong>Protein:</strong> 1.6g per kg of body weight
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 py-2">
                      <strong>Fat:</strong> 25% of total calories
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 py-2">
                      <strong>Carbohydrates:</strong> Remaining calories after protein and fat
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default AboutPage; 