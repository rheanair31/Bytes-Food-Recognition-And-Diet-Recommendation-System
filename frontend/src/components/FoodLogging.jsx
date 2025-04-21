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
    formData.append('foodName', foodName);
    formData.append('mealtime', mealtime);

    try {
      const response = await axios.post('/api/analyze-food', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze food image. Please try again.');
      console.error(err);
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
              <Form.Label>Food Name (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Chicken Salad"
              />
            </Form.Group>

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
                <strong>Food Name:</strong> {result.foodName}
              </li>
              <li>
                <strong>Calories:</strong> {result.calories} kcal
              </li>
              <li>
                <strong>Protein:</strong> {result.protein}g
              </li>
              <li>
                <strong>Carbohydrates:</strong> {result.carbs}g
              </li>
              <li>
                <strong>Fats:</strong> {result.fats}g
              </li>
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