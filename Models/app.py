import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import json

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths for food data and models
food_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seasonal_food_database.csv')
models_dir = os.path.dirname(os.path.abspath(__file__))

# Debug print to verify paths
logger.debug(f"Using food database at: {food_data_path}")
logger.debug(f"Using models directory: {models_dir}")

from diet_recommendation_app import DietRecommendationApp  # Import the class if it is in a separate file

# Check if the data file exists
if not os.path.exists(food_data_path):
    logger.warning(f"Food data file not found at {food_data_path}")
    
# Create a global instance of the recommendation system
try:
    recommender = DietRecommendationApp(food_data_path=food_data_path, models_dir=models_dir)
    logger.info("Diet Recommendation App initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Diet Recommendation App: {e}")
    recommender = None

@app.route('/')
def index():
    """Home page with links to the app's features"""
    logger.info("Rendering home page")
    return render_template('index.html')


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    """User profile form and submission handler with detailed error logging"""
    if request.method == 'POST':
        try:
            # Log request content type and determine data format
            content_type = request.headers.get('Content-Type', '')
            logger.debug(f"Content-Type: {content_type}")
            
            # Handle JSON data from frontend React app
            if 'application/json' in content_type:
                data = request.json
                logger.debug(f"JSON data received: {data}")
                
                # Extract user profile data from JSON
                try:
                    age = int(data.get('age', 0))
                except ValueError:
                    logger.error("Invalid age input.")
                    age = 0
                logger.debug(f"Age: {age}")
                
                sex = data.get('sex', '').strip().lower()
                logger.debug(f"Sex: {sex}")
                
                try:
                    weight_kg = float(data.get('weight_kg', 0))
                except ValueError:
                    logger.error("Invalid weight input.")
                    weight_kg = 0.0
                logger.debug(f"Weight (kg): {weight_kg}")
                
                try:
                    height_cm = float(data.get('height_cm', 0))
                except ValueError:
                    logger.error("Invalid height input.")
                    height_cm = 0.0
                logger.debug(f"Height (cm): {height_cm}")
                
                activity_level = data.get('activity_level', '').strip()
                goal = data.get('goal', '').strip()
                diet_type = data.get('diet_type', '').strip()
                logger.debug(f"Activity Level: {activity_level}")
                logger.debug(f"Goal: {goal}")
                logger.debug(f"Diet Type: {diet_type}")
                
                # Get allergies directly from the JSON data
                allergies = data.get('allergies', [])
                logger.debug(f"Allergies: {allergies}")
                
                # Get cuisine preferences directly from the JSON data
                cuisines = data.get('cuisines', {})
                for meal in cuisines:
                    logger.debug(f"{meal.capitalize()} Cuisines: {cuisines[meal]}")
                
            # Handle form data (traditional form submission)
            else:
                logger.debug(f"Form data received: {request.form}")
                
                try:
                    age = int(request.form.get('age', '0'))
                except ValueError:
                    logger.error("Invalid age input.")
                    age = 0
                logger.debug(f"Age: {age}")
                
                sex = request.form.get('sex', '').strip().lower()
                logger.debug(f"Sex: {sex}")
                
                try:
                    weight_kg = float(request.form.get('weight', '0'))
                except ValueError:
                    logger.error("Invalid weight input.")
                    weight_kg = 0.0
                logger.debug(f"Weight (kg): {weight_kg}")
                
                try:
                    height_cm = float(request.form.get('height', '0'))
                except ValueError:
                    logger.error("Invalid height input.")
                    height_cm = 0.0
                logger.debug(f"Height (cm): {height_cm}")
                
                activity_level = request.form.get('activity_level', '').strip()
                goal = request.form.get('goal', '').strip()
                diet_type = request.form.get('diet_type', '').strip()
                logger.debug(f"Activity Level: {activity_level}")
                logger.debug(f"Goal: {goal}")
                logger.debug(f"Diet Type: {diet_type}")
                
                # Parse allergies
                allergies_str = request.form.get('allergies', '')
                allergies = [a.strip() for a in allergies_str.split(',') if a.strip()]
                logger.debug(f"Allergies: {allergies}")
                
                # Parse cuisine preferences
                cuisines = {}
                for meal in ['breakfast', 'lunch', 'dinner', 'snack']:
                    selected = request.form.getlist(f'{meal}_cuisines')
                    cuisines[meal] = selected if selected else []
                    logger.debug(f"{meal.capitalize()} Cuisines: {cuisines[meal]}")
            
            # Build user profile
            user_profile = {
                'age': age,
                'sex': sex,
                'weight_kg': weight_kg,
                'height_cm': height_cm,
                'activity_level': activity_level,
                'goal': goal,
                'diet_type': diet_type,
                'allergies': allergies,
                'cuisines': cuisines
            }
            logger.debug(f"Constructed User Profile: {user_profile}")

            # Save to file
            try:
                with open('user_profile.json', 'w') as f:
                    json.dump(user_profile, f, indent=4)
                logger.info("User profile saved successfully.")
            except Exception as e:
                logger.exception("Failed to save user profile.")
                return jsonify({"error": f"Error saving profile: {str(e)}"}), 500
                
            # Generate meal plan with the recommender
            if recommender:
                try:
                    daily_plan = recommender.recommend_daily_meals(user_profile)
                    
                    # Add seasonal information to the meal plan
                    current_season = recommender.determine_current_season()
                    daily_plan['current_season'] = current_season
                    
                    # Get seasonal recommendations
                    seasonal_recommendations = {}
                    meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
                    
                    for meal_type in meal_types:
                        seasonal_items = recommender.get_seasonal_recommendations(
                            diet_type=user_profile.get('diet_type', ''),
                            meal_type=meal_type,
                            cuisines=user_profile.get('cuisines', {}).get(meal_type)
                        )
                        seasonal_recommendations[meal_type] = seasonal_items
                    
                    # Add seasonal recommendations to the meal plan
                    daily_plan['seasonal_recommendations'] = seasonal_recommendations
                    
                    logger.info("Meal plan generated successfully.")
                    
                    # Return JSON response for AJAX requests
                    if 'application/json' in content_type or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify(daily_plan)
                    return redirect(url_for('meal_plan'))
                    
                except Exception as e:
                    logger.exception("Error generating meal plan.")
                    return jsonify({"error": f"Error generating meal plan: {str(e)}"}), 500
            else:
                logger.error("Recommendation system is not available")
                return jsonify({"error": "Recommendation system is not available"}), 500

        except Exception as e:
            logger.exception("Unexpected error in /profile route.")
            return jsonify({"error": f"Server error: {str(e)}"}), 500

    # GET request
    logger.info("Rendering profile form page.")
    return render_template('profile.html')



@app.route('/meal-plan')
def meal_plan():
    """Generate and display meal plan based on user profile"""
    try:
        # Load user profile from file
        with open('user_profile.json', 'r') as f:
            user_profile = json.load(f)
        
        # Generate meal plan
        if recommender:
            daily_plan = recommender.recommend_daily_meals(user_profile)
            
            # Add seasonal information to the meal plan
            current_season = recommender.determine_current_season()
            daily_plan['current_season'] = current_season
            
            # Get seasonal recommendations
            seasonal_recommendations = {}
            meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
            
            for meal_type in meal_types:
                seasonal_items = recommender.get_seasonal_recommendations(
                    diet_type=user_profile.get('diet_type', ''),
                    meal_type=meal_type,
                    cuisines=user_profile.get('cuisines', {}).get(meal_type)
                )
                seasonal_recommendations[meal_type] = seasonal_items
            
            # Add seasonal recommendations to the meal plan
            daily_plan['seasonal_recommendations'] = seasonal_recommendations
            
            logger.info(f"Generated meal plan with seasonal data: {daily_plan}")
            
            # Save the plan to a file for download
            filename = recommender.save_meal_plan(daily_plan)
            
            return render_template(
                'meal_plan.html',
                daily_plan=daily_plan,
                user_profile=user_profile,
                filename=filename
            )
        else:
            logger.error("Recommendation system is not available")
            return jsonify({"error": "Recommendation system is not available"}), 500
    
    except Exception as e:
        logger.error(f"Error generating meal plan: {str(e)}")
        return jsonify({"error": f"Error generating meal plan: {str(e)}"}), 500
    
    
@app.route('/seasonal-recommendations')
def seasonal_recommendations():
    try:
        # Load user profile from file
        with open('user_profile.json', 'r') as f:
            user_profile = json.load(f)
        
        diet_type = user_profile.get('diet_type')
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
        
        seasonal_recommendations = {}
        current_season = recommender.determine_current_season()
        
        for meal_type in meal_types:
            seasonal_items = recommender.get_seasonal_recommendations(
                diet_type=diet_type,
                meal_type=meal_type,
                cuisines=user_profile.get('cuisines', {}).get(meal_type)
            )
            seasonal_recommendations[meal_type] = seasonal_items['foods'][:5]
        
        logger.debug(f"Current season: {current_season}")
        logger.debug(f"Seasonal recommendations: {seasonal_recommendations}")


        return render_template(
            'seasonal.html',
            seasonal_recommendations=seasonal_recommendations,
            current_season=current_season,
            user_profile=user_profile
        )
    
    except Exception as e:
        return render_template('error.html', message=f"Error getting seasonal recommendations: {str(e)}")

@app.route('/download/<filename>')
def download_meal_plan(filename):
    """Download the meal plan JSON file"""
    try:
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return render_template('error.html', message=f"Error downloading file: {str(e)}")

@app.route('/bmr-calculator', methods=['GET', 'POST'])
def bmr_calculator():
    """Simple BMR and calorie needs calculator"""
    if request.method == 'POST':
        try:
            age = int(request.form['age'])
            sex = request.form['sex'].lower()
            weight = float(request.form['weight'])
            height = float(request.form['height'])
            activity_level = request.form['activity_level']
            
            if recommender:
                calorie_info = recommender.calculate_bmr(age, sex, weight, height, activity_level)
                goal, reason = recommender.recommend_goal(age, sex, weight, height)
                
                return render_template(
                    'bmr_results.html',
                    calorie_info=calorie_info,
                    goal=goal,
                    reason=reason
                )
            else:
                return render_template('error.html', message="Recommendation system is not available")
                
        except Exception as e:
            return render_template('error.html', message=f"Error calculating BMR: {str(e)}")
    
    # GET request - show the form
    activity_levels = [
        {'id': 'sedentary', 'name': 'Sedentary (little or no exercise)'},
        {'id': 'light', 'name': 'Light (light exercise 1-3 days/week)'},
        {'id': 'moderate', 'name': 'Moderate (moderate exercise 3-5 days/week)'},
        {'id': 'active', 'name': 'Active (hard exercise 6-7 days/week)'},
        {'id': 'very_active', 'name': 'Very Active (very hard exercise & physical job)'}
    ]
    
    return render_template('bmr_calculator.html', activity_levels=activity_levels)

@app.route('/food-search')
def food_search():
    """Search for foods in the database"""
    query = request.args.get('query', '')
    
    if query and recommender and hasattr(recommender, 'food_df'):
        # Simple search by food name
        results = recommender.food_df[
            recommender.food_df['food_name'].str.contains(query, case=False)
        ].head(10).to_dict('records')
        
        return render_template('search_results.html', results=results, query=query)
    
    return render_template('food_search.html')

@app.route('/similar-foods/<food_id>')
def similar_foods(food_id):
    """Show similar foods to the selected food"""
    if recommender:
        similar = recommender.get_similar_foods(food_id, top_n=5)
        
        # Get the original food details
        food_details = None
        if hasattr(recommender, 'food_df'):
            food_df = recommender.food_df
            food_row = food_df[food_df['food_id'] == food_id]
            if not food_row.empty:
                food_details = food_row.iloc[0].to_dict()
        
        return render_template(
            'similar_foods.html',
            similar_foods=similar,
            food_details=food_details
        )
    
    return render_template('error.html', message="Recommendation system is not available")

if __name__ == '__main__':
    app.run(debug=True)