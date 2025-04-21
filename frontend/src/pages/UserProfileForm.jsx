import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaBullseye, 
  FaUtensils, 
  FaUtensilSpoon,
  FaInfoCircle,
  FaRunning,
  FaWalking,
  FaBiking,
  FaSwimmer,
  FaCouch,
  FaWeight,
  FaBalanceScale,
  FaDumbbell,
  // FaCarrot,
  FaLeaf,
  FaSeedling,
  FaCheck,
  FaTimes,
  FaBreadSlice,
  FaHamburger,
  FaPizzaSlice,
  FaCookie,
  FaSearch,
  FaDrumstickBite
} from 'react-icons/fa';
import './UserProfileForm.css';

// Sound effects
const playSound = (type) => {
  if (typeof window !== 'undefined' && window.Audio) {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
  }
};

// Haptic feedback
const vibrate = () => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }
};

const UserProfileForm = ({ setUserProfile, setMealPlan }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    age: '',
    sex: 'male',
    weight_kg: '',
    height_cm: '',
    activity_level: 'moderate',
    goal: '',
    diet_type: 'Regular',
    allergies: '',
    cuisines: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
  });

  const [gridColumns, setGridColumns] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [surpriseMe, setSurpriseMe] = useState(false);

  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width < 480) setGridColumns(2);
      else if (width < 768) setGridColumns(3);
      else if (width < 1024) setGridColumns(4);
      else setGridColumns(5);
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  const mealIcons = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍛',
    snack: '🍪'
  };

  const mealTitles = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks'
  };

  const cuisineOptions = [
    { value: 'Spanish', icon: '🇪🇸', color: '#FF6B6B', rgb: '255, 107, 107' },
    { value: 'Korean', icon: '🇰🇷', color: '#4ECDC4', rgb: '78, 205, 196' },
    { value: 'Mexican', icon: '🇲🇽', color: '#FFD166', rgb: '255, 209, 102' },
    { value: 'Lebanese', icon: '🇱🇧', color: '#06D6A0', rgb: '6, 214, 160' },
    { value: 'Thai', icon: '🇹🇭', color: '#118AB2', rgb: '17, 138, 178' },
    { value: 'Chinese', icon: '🇨🇳', color: '#EF476F', rgb: '239, 71, 111' },
    { value: 'Italian', icon: '🇮🇹', color: '#073B4C', rgb: '7, 59, 76' },
    { value: 'Greek', icon: '🇬🇷', color: '#7209B7', rgb: '114, 9, 183' },
    { value: 'French', icon: '🇫🇷', color: '#3A0CA3', rgb: '58, 12, 163' },
    { value: 'Vietnamese', icon: '🇻🇳', color: '#4CC9F0', rgb: '76, 201, 240' },
    { value: 'American', icon: '🇺🇸', color: '#F72585', rgb: '247, 37, 133' },
    { value: 'Japanese', icon: '🇯🇵', color: '#4895EF', rgb: '72, 149, 239' },
    { value: 'Indian', icon: '🇮🇳', color: '#3F37C9', rgb: '63, 55, 201' },
    { value: 'Fruit', icon: '🍎', color: '#4CAF50', rgb: '76, 175, 80' }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (very hard exercise & physical job)' }
  ];

  const activityIcons = {
    sedentary: <FaCouch />,
    light: <FaWalking />,
    moderate: <FaBiking />,
    active: <FaRunning />,
    very_active: <FaSwimmer />
  };

  const goalOptions = [
    { 
      value: 'lose_weight', 
      label: 'Lose Weight',
      icon: <FaWeight />,
      tooltip: 'Create a calorie deficit to reduce fat'
    },
    { 
      value: 'maintain', 
      label: 'Maintain Weight',
      icon: <FaBalanceScale />,
      tooltip: 'Keep current body weight and body composition'
    },
    { 
      value: 'gain_weight', 
      label: 'Gain Weight',
      icon: <FaDumbbell />,
      tooltip: 'Build muscle mass or gain healthy weight'
    }
  ];

  const dietTypeOptions = [
    { 
      value: 'Regular', 
      label: 'Omnivore',
      icon: <FaDrumstickBite />,
      // edited 
      tooltip: 'Includes both plant and animal foods'
    },
    { 
      value: 'Vegetarian', 
      label: 'Vegetarian',
      icon: <FaLeaf />,
      tooltip: 'No meat/fish, includes dairy/eggs (if any)'
    },
    { 
      value: 'Vegan', 
      label: 'Vegan',
      icon: <FaSeedling />,
      tooltip: 'Fully plant-based, no animal-derived foods'
    }
  ];

  const filteredCuisines = (cuisines) => {
    if (!searchQuery) return cuisines;
    return cuisines.filter(cuisine => 
      cuisine.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSurpriseMe = () => {
    vibrate();
    playSound('select');
    setSurpriseMe(!surpriseMe);
    if (!surpriseMe) {
      // Select a balanced variety of cuisines
      const balancedSelection = {
        breakfast: ['American', 'French', 'Japanese'],
        lunch: ['Italian', 'Mexican', 'Indian'],
        dinner: ['Chinese', 'Thai', 'Greek'],
        snack: ['Fruit', 'Spanish', 'Vietnamese']
      };
      setFormData(prev => ({
        ...prev,
        cuisines: balancedSelection
      }));
    } else {
      // Clear all selections
      setFormData(prev => ({
        ...prev,
        cuisines: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCuisineChange = (meal, cuisine) => {
    vibrate();
    playSound('click');
    setFormData(prevData => {
      const updatedCuisines = { ...prevData.cuisines };
      
      if (updatedCuisines[meal].includes(cuisine)) {
        updatedCuisines[meal] = updatedCuisines[meal].filter(c => c !== cuisine);
      } else {
        updatedCuisines[meal] = [...updatedCuisines[meal], cuisine];
      }
      
      return {
        ...prevData,
        cuisines: updatedCuisines
      };
    });
  };

  const handleSelectAll = (meal) => {
    setFormData(prevData => ({
      ...prevData,
      cuisines: {
        ...prevData.cuisines,
        [meal]: cuisineOptions.map(c => c.value)
      }
    }));
  };

  const handleClearAll = (meal) => {
    setFormData(prevData => ({
      ...prevData,
      cuisines: {
        ...prevData.cuisines,
        [meal]: []
      }
    }));
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Process allergies string into array
      const processedFormData = {
        ...formData,
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item !== '')
      };

      setUserProfile(processedFormData);
      
      // Send data to backend
      const response = await axios.post('http://localhost:5000/profile', processedFormData);
      
      setMealPlan(response.data);
      setLoading(false);
      navigate('/meal-plan');
    } catch (err) {
      setLoading(false);
      setError('There was an error generating your meal plan. Please try again.');
      console.error('Error submitting form:', err);
    }
  };

  const calculateBMI = () => {
    if (formData.weight_kg && formData.height_cm) {
      const heightM = formData.height_cm / 100;
      return (formData.weight_kg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'warning' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'danger' };
  };

  const getRecommendedGoal = () => {
    const bmi = calculateBMI();
    if (!bmi) return null;
    
    if (bmi < 18.5) return 'gain_weight';
    if (bmi >= 25) return 'lose_weight';
    return 'maintain';
  };

  const CuisineToggle = ({ cuisine, isSelected, onToggle }) => {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`cuisine-pill ${isSelected ? 'selected' : ''}`}
        onClick={onToggle}
        style={{ 
          '--cuisine-color': cuisine.color,
          '--cuisine-color-rgb': cuisine.rgb
        }}
        aria-checked={isSelected}
        role="switch"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="cuisine-icon">{cuisine.icon}</span>
        <span className="cuisine-label">{cuisine.value}</span>
        <AnimatePresence>
          {isSelected && (
            <motion.span 
              className="check-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <FaCheck />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Basic Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>
                    Age
                    <FaInfoCircle className="info-icon" title="Enter your age in years" />
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age (in years)"
                    className="custom-select"
                    required
                    min="1"
                    max="120"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Sex</Form.Label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="sex-male"
                        name="sex"
                        value="male"
                        checked={formData.sex === 'male'}
                        onChange={handleChange}
                      />
                      <label htmlFor="sex-male" className="radio-label">Male</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="sex-female"
                        name="sex"
                        value="female"
                        checked={formData.sex === 'female'}
                        onChange={handleChange}
                      />
                      <label htmlFor="sex-female" className="radio-label">Female</label>
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>
                    Weight (kg)
                    <FaInfoCircle className="info-icon" title="Enter your weight in kilograms" />
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    placeholder="Enter your weight in kilograms"
                    className="custom-select"
                    required
                    step="0.1"
                    min="20"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>
                    Height (cm)
                    <FaInfoCircle className="info-icon" title="Enter your height in centimeters" />
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    placeholder="Enter your height in centimeters"
                    className="custom-select"
                    required
                    min="50"
                  />
                </Form.Group>
              </Col>
            </Row>

            {calculateBMI() && (
              <Card className="mb-4 mt-2">
                <Card.Body>
                  <h5>BMI: {calculateBMI()}</h5>
                  <p className={`text-${getBMICategory(calculateBMI()).color}`}>
                    {getBMICategory(calculateBMI()).category}
                  </p>
                </Card.Body>
              </Card>
            )}

            <Form.Group className="mb-4">
              <Form.Label>
                Activity Level
                <FaInfoCircle className="info-icon" title="Select your typical activity level" />
              </Form.Label>
              <div className="activity-toggle">
                {activityLevels.map((level) => (
                  <div key={level.value} className="activity-option">
                    <input
                      type="radio"
                      id={`activity-${level.value}`}
                      name="activity_level"
                      value={level.value}
                      checked={formData.activity_level === level.value}
                      onChange={handleChange}
                    />
                    <label htmlFor={`activity-${level.value}`} className="activity-label">
                      <span className="activity-icon">{activityIcons[level.value]}</span>
                      {level.label.split('(')[0].trim()}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <button
                className="next-button"
                onClick={nextStep}
                tabIndex={0}
                aria-label="Proceed to next step"
              >
                Next
                <span className="arrow-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="section-header-with-icon">
              <FaBullseye className="section-header-icon" />
              <h4>Goals and Diet Preferences</h4>
            </div>
            
            <Form.Group className="mb-4">
              <Form.Label>
                Your Goal
                <FaInfoCircle className="info-icon" title="Select your primary health goal" />
              </Form.Label>
              <div className="mb-2">
                {getRecommendedGoal() && (
                  <small className="text-muted">
                    Based on your BMI, we recommend: <strong>{getRecommendedGoal() === 'lose_weight' ? 'Weight Loss' : getRecommendedGoal() === 'gain_weight' ? 'Weight Gain' : 'Weight Maintenance'}</strong>
                  </small>
                )}
              </div>
              <div className="goal-toggle">
                {goalOptions.map((option) => (
                  <div key={option.value} className="goal-option">
                    <input
                      type="radio"
                      id={`goal-${option.value}`}
                      name="goal"
                      value={option.value}
                      checked={formData.goal === option.value}
                      onChange={handleChange}
                    />
                    <label htmlFor={`goal-${option.value}`} className="goal-label">
                      <span className="goal-icon">{option.icon}</span>
                      <span>{option.label}</span>
                      <div className="goal-tooltip">{option.tooltip}</div>
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="section-divider" />

            <Form.Group className="mb-4">
              <Form.Label>
                Diet Type
                <FaInfoCircle className="info-icon" title="Select your dietary preferences" />
              </Form.Label>
              <div className="diet-toggle">
                {dietTypeOptions.map((option) => (
                  <div key={option.value} className="diet-option">
                    <input
                      type="radio"
                      id={`diet-${option.value}`}
                      name="diet_type"
                      value={option.value}
                      checked={formData.diet_type === option.value}
                      onChange={handleChange}
                    />
                    <label htmlFor={`diet-${option.value}`} className="diet-label">
                      <span className="diet-icon">{option.icon}</span>
                      <span>{option.label}</span>
                      <div className="diet-tooltip">{option.tooltip}</div>
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="section-divider" />

            <Form.Group className="mb-4">
              <Form.Label>
                Allergies
                <FaInfoCircle className="info-icon" title="List any food allergies or intolerances" />
              </Form.Label>
              <div className="allergies-container">
                <div className="allergies-input">
                  {formData.allergies.split(',').map((allergy, index) => (
                    allergy.trim() && (
                      <div key={index} className="allergy-tag">
                        {allergy.trim()}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedAllergies = formData.allergies
                              .split(',')
                              .filter((_, i) => i !== index)
                              .join(',');
                            setFormData({ ...formData, allergies: updatedAllergies });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )
                  ))}
                  <input
                    type="text"
                    placeholder="Type an allergy and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newAllergy = e.target.value.trim();
                        if (newAllergy) {
                          setFormData({
                            ...formData,
                            allergies: formData.allergies
                              ? `${formData.allergies},${newAllergy}`
                              : newAllergy
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={prevStep}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </Button>
              <Button variant="primary" onClick={nextStep}>
                Next <i className="fas fa-arrow-right ms-1"></i>
              </Button>
            </div>
          </>
        );

        case 3:
          return (
            <>
              <div className="section-header-with-icon">
                <FaUtensils className="section-header-icon" />
                <h4>Cuisine Preferences</h4>
              </div>
        
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
        
              <div className="surprise-me-container">
                <label className="surprise-me-label">
                  <input
                    type="checkbox"
                    checked={surpriseMe}
                    onChange={handleSurpriseMe}
                    className="surprise-me-checkbox"
                  />
                  <span className="surprise-me-text">Surprise me with a balanced variety!</span>
                </label>
              </div>
        
              {['breakfast', 'lunch', 'dinner'].map((meal) => (
                <motion.div
                  key={meal}
                  className="meal-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="meal-header">
                    <div className="meal-title">
                      <span className="meal-icon">{mealIcons[meal]}</span>
                      <h5>{mealTitles[meal]} Preferences</h5>
                      <span className="selection-badge">
                        {formData.cuisines[meal].length}/{cuisineOptions.length}
                      </span>
                    </div>
                  </div>
        
                  <div className="meal-actions">
                    <motion.button
                      className={`action-button select-all ${formData.cuisines[meal].length === cuisineOptions.length ? 'active' : ''}`}
                      onClick={() => {
                        vibrate();
                        playSound('select');
                        handleSelectAll(meal);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaCheck /> {formData.cuisines[meal].length === cuisineOptions.length ? 'Unselect All' : 'Select All'}
                    </motion.button>
                    <motion.button
                      className="action-button clear-all"
                      onClick={() => {
                        vibrate();
                        playSound('clear');
                        handleClearAll(meal);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={formData.cuisines[meal].length === 0 ? { opacity: 0.5 } : { opacity: 1 }}
                    >
                      <FaTimes /> Clear
                    </motion.button>
                  </div>
        
                  <motion.div
                    className="cuisine-selection"
                    style={{
                      gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                      gap: '0.75rem',
                    }}
                  >
                    <AnimatePresence>
                      {filteredCuisines(cuisineOptions).map((cuisine) => (
                        <CuisineToggle
                          key={cuisine.value}
                          cuisine={cuisine}
                          isSelected={formData.cuisines[meal].includes(cuisine.value)}
                          onToggle={() => handleCuisineChange(meal, cuisine.value)}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
        
        <div className="form-footer">
        <motion.button
          className="back-button"
          onClick={prevStep}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        <motion.button
          className="submit-button"
          type="button"
          disabled={loading || !formData.goal}
          onClick={async () => {
            setLoading(true);
            setError(null);

            try {
              // Process allergies string into array
              const processedFormData = {
                ...formData,
                allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item !== ''),
              };

              // Save user profile data to be used in the meal plan page
              setUserProfile(processedFormData);

              // API call to backend to generate meal plan
              const response = await fetch('http://localhost:5000/profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(processedFormData),
              });

              if (response.ok) {
                // Successful submission, handle the response
                const data = await response.json();
                console.log('Generated Meal Plan:', data);
                
                // Save the meal plan data
                setMealPlan(data);
                
                // Use React Router's navigate instead of window.location
                navigate('/meal-plan');
              } else {
                // Handle error response
                const errorData = await response.json();
                console.error('Error submitting profile:', errorData.message);
                setError(errorData.message);
              }
            } catch (error) {
              // Catch network errors or other unexpected issues
              setError(error.message);
              console.error('Error generating meal plan:', error);
            } finally {
              setLoading(false);
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Generating Plan...' : '🍽 Generate Meal Plan'}
        </motion.button>
      </div>

        
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </>
          );
        
  
      

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: 'Basic Info', icon: <FaUser /> },
    { id: 2, label: 'Goals & Diet', icon: <FaBullseye /> },
    { id: 3, label: 'Cuisines', icon: <FaUtensils /> }
  ];

  return (
    <div className="user-profile-form">
      <div className="section-header">
        <div className="title-wrapper">
          <FaUtensilSpoon className="title-icon" />
          <h1>Create Your Meal Plan</h1>
        </div>
        <p className="section-subtitle">
          Let's get to know you better to personalize your plan
        </p>
      </div>
      
      <div className="progress-container">
        <div className="progress-wrapper">
          <ProgressBar className="custom-progress">
            <ProgressBar 
              variant="success" 
              now={step >= 1 ? 33.33 : 0} 
              key={1}
              className="progress-segment"
            />
            <ProgressBar 
              variant="success" 
              now={step >= 2 ? 33.33 : 0} 
              key={2}
              className="progress-segment"
            />
            <ProgressBar 
              variant="success" 
              now={step >= 3 ? 33.33 : 0} 
              key={3}
              className="progress-segment"
            />
          </ProgressBar>
        </div>
        
        <div className="steps-container">
          {steps.map((stepItem) => (
            <div 
              key={stepItem.id}
              className={`step-item ${step >= stepItem.id ? 'active' : ''}`}
            >
              <div className="step-icon">{stepItem.icon}</div>
              <div className="step-content">
                <div className="step-number">{stepItem.id}</div>
                <div className="step-label">{stepItem.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {renderStep()}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfileForm; 