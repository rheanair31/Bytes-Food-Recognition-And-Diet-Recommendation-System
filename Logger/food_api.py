from flask import Flask, request, jsonify, send_from_directory
from keras.models import load_model
from keras.preprocessing import image
import numpy as np
import os
import requests
import re
from flask_cors import CORS

# Update these paths to match your project structure
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_food_101.h5")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
# Configure CORS to allow requests from your React frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# Set upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load model once at startup
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyA2lqZZ_H3JmlAVLhiahjM0mo5qsFMZrsA"  # Your actual key
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
)

# Simplified calorie base types: only 'piece' or 'serving'
calorie_base_label = {
    # piecewise foods
    "apple_pie": "piece", "baklava": "piece", "beignets": "piece",
    "cannoli": "piece", "carrot_cake": "piece", "cheesecake": "piece",
    "chicken_quesadilla": "piece", "churros": "piece", "club_sandwich": "piece",
    "cup_cakes": "piece", "donuts": "piece", "dumplings": "piece",
    "falafel": "piece", "hamburger": "piece", "hot_dog": "piece",
    "macarons": "piece", "onion_rings": "piece", "pancakes": "piece",
    "pizza": "piece", "samosa": "piece", "sashimi": "piece",
    "spring_rolls": "piece", "sushi": "piece", "tacos": "piece",
    "tiramisu": "piece", "waffles": "piece",
    # everything else is treated as a whole serving
}

# Full labels list matching model
labels = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare", "beet_salad",
    "beignets", "bibimbap", "bread_pudding", "breakfast_burrito", "bruschetta", "caesar_salad",
    "cannoli", "caprese_salad", "carrot_cake", "ceviche", "cheesecake", "cheese_plate",
    "chicken_curry", "chicken_quesadilla", "chicken_wings", "chocolate_cake", "chocolate_mousse",
    "churros", "clam_chowder", "club_sandwich", "crab_cakes", "creme_brulee", "croque_madame",
    "cup_cakes", "deviled_eggs", "donuts", "dumplings", "edamame", "eggs_benedict", "escargots",
    "falafel", "filet_mignon", "fish_and_chips", "foie_gras", "french_fries", "french_onion_soup",
    "french_toast", "fried_calamari", "fried_rice", "frozen_yogurt", "garlic_bread", "gnocchi",
    "greek_salad", "grilled_cheese_sandwich", "grilled_salmon", "guacamole", "gyoza", "hamburger",
    "hot_and_sour_soup", "hot_dog", "huevos_rancheros", "hummus", "ice_cream", "lasagna",
    "lobster_bisque", "lobster_roll_sandwich", "macaroni_and_cheese", "macarons", "miso_soup",
    "mussels", "nachos", "omelette", "onion_rings", "oysters", "pad_thai", "paella", "pancakes",
    "panna_cotta", "peking_duck", "pho", "pizza", "pork_chop", "poutine", "prime_rib",
    "pulled_pork_sandwich", "ramen", "ravioli", "red_velvet_cake", "risotto", "samosa",
    "sashimi", "scallops", "seaweed_salad", "shrimp_and_grits", "spaghetti_bolognese",
    "spaghetti_carbonara", "spring_rolls", "steak", "strawberry_shortcake", "sushi", "tacos",
    "takoyaki", "tiramisu", "tuna_tartare", "waffles"
]

# Preprocess image for prediction
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    arr = image.img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    return arr / 255.0

# Extract piecewise info: calories per piece, weight per piece, total weight, total calories
def extract_piecewise_info(text):
    try:
        # Split the comma-separated values returned by Gemini
        values = text.split(',')
        if len(values) >= 4:
            # Convert values to appropriate types
            try:
                wp = float(values[0].strip())  # Weight per piece
                cp = int(values[1].strip())    # Calories per piece
                tw = float(values[2].strip())  # Total weight of one serving
                tc = int(values[3].strip())    # Total calories of one serving
                return cp, wp, tw, tc
            except ValueError as e:
                print(f"Value error in piecewise info: {e}")
                return None, None, None, None
        return None, None, None, None
    except Exception as e:
        print(f"Error parsing piecewise info: {e}")
        return None, None, None, None

def extract_serving_info(text):
    try:
        # Split the comma-separated values returned by Gemini
        values = text.split(',')
        if len(values) >= 3:
            try:
                tw = float(values[0].strip())     # Total weight of one serving (g)
                tc = int(values[1].strip())       # Total calories of one serving (kcal)
                cp_100g = int(values[2].strip())  # Calories per 100g
                print(f"Extracted values: Total Weight = {tw}g, Total Calories = {tc}kcal, Calories per 100g = {cp_100g}kcal")
                return tw, tc, cp_100g
            except ValueError as e:
                print(f"Value error in serving info: {e}")
                return None, None, None
        else:
            print(f"Unexpected serving info format: {text}")
            return None, None, None
    except Exception as e:
        print(f"Error parsing serving info: {e}")
        return None, None, None

def get_nutrition_info(food_name):
    """Fallback nutrition data if Gemini API fails"""
    nutrition_fallbacks = {
        "fried_rice": {
            "is_piecewise": False,
            "total_weight": 300,
            "total_calories": 420,
            "calories_per_100g": 140
        },
        # Add more fallbacks for common foods here
    }
    
    # Return fallback data or default values
    return nutrition_fallbacks.get(food_name, {
        "is_piecewise": False,
        "total_weight": 200,
        "total_calories": 300,
        "calories_per_100g": 150
    })

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    if model is None:
        return jsonify({'error': 'Model not loaded. Check server logs.'}), 500

    file = request.files['image']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400
        
    # Save the uploaded file
    filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filename)

    try:
        img_arr = preprocess_image(filename)
        preds = model.predict(img_arr)
        idx = np.argmax(preds)
        food = labels[idx]

        # Determine if piecewise or serving
        base = calorie_base_label.get(food, 'serving')
        prompt_food = food.replace('_', ' ')

        # Build prompt for Gemini
        if base == 'piece':
            prompt = (
                f"For {prompt_food}, provide the following values, separated by commas:"  
                " Weight per piece (g), Calories per piece (kcal), Total weight of one serving (g), Total calories of one serving (kcal). No extra text."
            )
        else:
            prompt = (
                f"For {prompt_food}, provide the following values, separated by commas:"  
                " Total weight (g), Total calories (kcal), Calories per 100 grams (kcal). No extra text."
            )

        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        print("Sending prompt to Gemini:", prompt)
        
        # Initialize result variables with default values
        result = {
            'food': food,
            'confidence': float(preds[0][idx]),
            'is_piecewise': base == 'piece'
        }
        
        try:
            resp = requests.post(GEMINI_API_URL, headers={"Content-Type": "application/json"}, json=payload)
            
            if resp.status_code == 200:
                try:
                    reply = resp.json()['candidates'][0]['content']['parts'][0]['text']
                    print("Gemini API output:", reply)
                    
                    # Parse and return the values
                    if base == 'piece':
                        cp, wp, tw, tc = extract_piecewise_info(reply)
                        if cp and wp and tw and tc:
                            result.update({
                                'calories_per_piece': cp,
                                'weight_per_piece': wp,
                                'total_weight': tw,
                                'total_calories': tc
                            })
                        else:
                            # Use fallback data
                            fallback = get_nutrition_info(food)
                            result.update({
                                'calories_per_piece': fallback.get('calories_per_piece', 250),
                                'weight_per_piece': fallback.get('weight_per_piece', 100),
                                'total_weight': fallback.get('total_weight', 300),
                                'total_calories': fallback.get('total_calories', 750)
                            })
                    else:
                        tw, tc, cp_100g = extract_serving_info(reply)
                        if tw and tc and cp_100g:
                            result.update({
                                'total_weight': tw,
                                'total_calories': tc,
                                'calories_per_100g': cp_100g
                            })
                        else:
                            # Use fallback data
                            fallback = get_nutrition_info(food)
                            result.update({
                                'total_weight': fallback.get('total_weight', 200),
                                'total_calories': fallback.get('total_calories', 300),
                                'calories_per_100g': fallback.get('calories_per_100g', 150)
                            })
                except Exception as parse_error:
                    print(f"Error parsing Gemini response: {parse_error}")
                    # Use fallback data
                    fallback = get_nutrition_info(food)
                    result.update(fallback)
            else:
                print(f"Gemini API error: {resp.status_code} - {resp.text}")
                # Use fallback data
                fallback = get_nutrition_info(food)
                result.update(fallback)
                
        except Exception as api_error:
            print(f"Error calling Gemini API: {api_error}")
            # Use fallback data
            fallback = get_nutrition_info(food)
            result.update(fallback)

        # Clean up the uploaded file
        os.remove(filename)
        return jsonify(result)

    except Exception as e:
        # Clean up file if it exists
        if os.path.exists(filename):
            os.remove(filename)
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'food-logging-api'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run on port 5001 instead of default 5000