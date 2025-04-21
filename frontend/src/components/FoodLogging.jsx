import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUpload, FaTimes, FaUtensils } from 'react-icons/fa';
import axios from 'axios';
import './FoodLogging.css';

const FoodLogging = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [mealtime, setMealtime] = useState('');

  // API base URL - Updated to use port 5001 for the food ML service
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty for production since they'll be served from the same origin
    : 'http://localhost:5001'; // Updated to port 5001 for the food ML service

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Call the predict endpoint on the new port
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Process the response from the backend
      const foodData = response.data;
      
      // Format the result
      setResult({
        foodName: foodData.food.replace(/_/g, ' '), // Convert snake_case to spaces
        calories: foodData.is_piecewise ? foodData.calories_per_piece : foodData.total_calories,
        // Store additional info that might be useful
        protein: "15g", // You can add estimates or placeholders
        carbs: "30g",   // You can add estimates or placeholders
        fats: "10g",    // You can add estimates or placeholders
        detectedFood: foodData.food,
        isPiecewise: foodData.is_piecewise,
        mealtime: mealtime, // From user input
        userFoodName: foodName || foodData.food.replace(/_/g, ' ') // Use user input if provided
      });
    } catch (err) {
      setError('Failed to analyze food image. Please try again.');
      console.error('Error details:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFoodName('');
    setMealtime('');
    setResult(null);
    setError(null);
  };

  return (
    <Card className="food-logging-card">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2">
          <FaUtensils />
          Log Your Food
        </Card.Title>
        
        {!result ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Upload Food Image</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="me-2"
                />
                {previewUrl && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
            </Form.Group>

            {previewUrl && (
              <div className="mb-3">
                <div className="image-preview">
                  <img
                    src={previewUrl}
                    alt="Food preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Mealtime (Optional)</Form.Label>
              <Form.Select
                value={mealtime}
                onChange={(e) => setMealtime(e.target.value)}
              >
                <option value="">Select mealtime</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !selectedFile}
              className="w-100"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaUpload className="me-2" />
                  Analyze Food
                </>
              )}
            </Button>
          </Form>
        ) : (
          <div className="analysis-results">
            <h5>Analysis Results</h5>
            <div className="macro-list">
              <li>
                <strong>Food Name:</strong> {result.userFoodName || result.foodName}
              </li>
              <li>
                <strong>Detected Food:</strong> {result.foodName}
              </li>
              <li>
                <strong>Calories:</strong> {result.calories} kcal
                {result.isPiecewise && <span className="text-muted"> (per piece)</span>}
              </li>
              {result.isPiecewise && (
                <li>
                  <strong>Type:</strong> Measured by piece
                </li>
              )}
              <li>
                <strong>Protein:</strong> {result.protein}
              </li>
              <li>
                <strong>Carbohydrates:</strong> {result.carbs}
              </li>
              <li>
                <strong>Fats:</strong> {result.fats}
              </li>
              {result.mealtime && (
                <li>
                  <strong>Meal:</strong> {result.mealtime.charAt(0).toUpperCase() + result.mealtime.slice(1)}
                </li>
              )}
            </div>
            <div className="d-flex gap-2 mt-4">
              <Button variant="success" className="flex-grow-1">
                Log This Meal
              </Button>
              <Button variant="outline-secondary" onClick={handleReset}>
                Try Another
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodLogging;