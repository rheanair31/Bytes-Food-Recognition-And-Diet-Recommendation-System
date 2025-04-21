import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FoodLogging from '../components/FoodLogging';

const FoodLoggingPage = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">Log Your Food</h1>
          <p className="text-center text-muted mb-4">
            Upload a photo of your meal to get instant nutritional analysis
          </p>
          <FoodLogging />
        </Col>
      </Row>
    </Container>
  );
};

export default FoodLoggingPage; 