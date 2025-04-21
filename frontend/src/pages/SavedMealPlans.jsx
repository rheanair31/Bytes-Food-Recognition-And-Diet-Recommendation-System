import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLeaf, FaDrumstickBite, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';
import './SavedMealPlans.css';

const SavedMealPlans = () => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/saved-meal-plans');
      const plans = Array.isArray(response.data) ? response.data : [];
      setSavedPlans(plans);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved plans:', err);
      setError('Failed to load saved meal plans. Please try again later.');
      setLoading(false);
      setSavedPlans([]);
    }
  };

  const handleDeletePlan = async (planId) => {
    setDeleteLoading(planId);
    try {
      await axios.delete(`/api/saved-meal-plans/${planId}`);
      setSavedPlans(prevPlans => {
        const plans = Array.isArray(prevPlans) ? prevPlans : [];
        return plans.filter(plan => plan._id !== planId);
      });
      setDeleteLoading(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const DietBadge = ({ dietType }) => {
    const getBadgeProps = (type) => {
      switch (type) {
        case 'Vegan':
          return {
            bg: 'success',
            icon: <FaLeaf size={14} />,
          };
        case 'Vegetarian':
          return {
            bg: 'info',
            icon: <FaLeaf size={14} />,
          };
        default:
          return {
            bg: 'secondary',
            icon: <FaDrumstickBite size={14} />,
          };
      }
    };

    const { bg, icon } = getBadgeProps(dietType);

    return (
      <Badge 
        bg={bg} 
        className="d-flex align-items-center gap-2 px-2 py-1"
        style={{ fontSize: '0.85rem', width: 'fit-content' }}
      >
        {icon}
        <span>{dietType}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your saved meal plans...</p>
      </div>
    );
  }

  return (
    <div className="saved-meal-plans">
      <h2>Your Saved Meal Plans</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {savedPlans.length === 0 ? (
        <Card className="empty-state">
          <Card.Body>
            <FaClipboardList className="empty-state-icon" />
            <h4>No Saved Meal Plans</h4>
            <p>You haven't saved any meal plans yet.</p>
            <Link to="/profile">
              <Button variant="primary">Create New Meal Plan</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>Diet Type</th>
                  <th>Goal</th>
                  <th>Daily Calories</th>
                  <th>Season</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td data-label="Date Created">{formatDate(plan.createdAt)}</td>
                    <td data-label="Diet Type">
                      <DietBadge dietType={plan.userProfile.diet_type} />
                    </td>
                    <td data-label="Goal">
                      {plan.userProfile.goal === 'lose_weight' && 'Weight Loss'}
                      {plan.userProfile.goal === 'maintain' && 'Maintenance'}
                      {plan.userProfile.goal === 'gain_weight' && 'Weight Gain'}
                    </td>
                    <td data-label="Daily Calories">{plan.mealPlan.daily_targets.daily_calories} cal</td>
                    <td data-label="Season" className="text-capitalize">{plan.mealPlan.current_season}</td>
                    <td data-label="Actions">
                      <div className="btn-group">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          as={Link}
                          to={`/meal-plan/${plan._id}`}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeletePlan(plan._id)}
                          disabled={deleteLoading === plan._id}
                        >
                          {deleteLoading === plan._id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SavedMealPlans; 