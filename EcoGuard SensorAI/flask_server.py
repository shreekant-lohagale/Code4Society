from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import os
import joblib

app = Flask(__name__)
# Enable CORS so the React Frontend on port 5173 can securely fetch the data
CORS(app)

CSV_FILE = 'live_sensor_today.csv' # Changed path to local dir

# Load the trained AI model
model = joblib.load('daily_emission_model.joblib')

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online", 
        "service": "EcoGuard SensorAI Middleware",
        "message": "Send NodeMCU data to POST /sensor_data. Fetch React UI data from GET /api/sensor_data."
    }), 200

@app.route('/sensor_data', methods=['POST'])
def receive_data():
    try:
        # 1. Catch the JSON data packet from the NodeMCU
        data = request.get_json()
        
        if not data or 'Raw_ADC' not in data:
            return jsonify({"error": "Invalid data format"}), 400

        # 2. Attach a verified, real-world timestamp from your laptop
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 3. Format it into a 1-row DataFrame
        new_row = pd.DataFrame([{
            'Timestamp': current_time,
            'Raw_ADC': data['Raw_ADC'],
            'NodeMCU_Volts': data['NodeMCU_Volts'],
            'Sensor_Volts': data['Sensor_Volts']
        }])
        
        # 4. Safely append to the CSV file
        # If the file doesn't exist yet, it creates it and writes the headers
        if not os.path.isfile(CSV_FILE):
            new_row.to_csv(CSV_FILE, index=False)
        else:
            new_row.to_csv(CSV_FILE, mode='a', header=False, index=False)
            
        print(f"[{current_time}] Data Saved -> ADC: {data['Raw_ADC']}")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sensor_data', methods=['GET'])
def get_sensor_prediction():
    try:
        now = datetime.now()
        day_of_week = now.weekday()
        click_hour = now.hour
        click_minute = now.minute
        
        # Read the raw sensor data dumped by the NodeMCU today
        if not os.path.isfile(CSV_FILE):
            return jsonify({"error": "No sensor data collected today."}), 404
            
        live_data = pd.read_csv(CSV_FILE)
        
        # Guard against empty CSV
        if live_data.empty:
            return jsonify({"error": "Sensor CSV is empty."}), 404
            
        current_cumulative_sum = float(live_data['Raw_ADC'].sum())
        
        # Apply the trained model
        ai_input = [[day_of_week, click_hour, click_minute, current_cumulative_sum]]
        predicted_final_total = float(model.predict(ai_input)[0])
        
        # Grab the last 15 raw ADC values for the React Live Chart
        raw_adc_history = live_data['Raw_ADC'].tail(15).tolist()
        # If we have less than 15, pad the start with the first value so the graph looks okay
        if len(raw_adc_history) < 15 and len(raw_adc_history) > 0:
            pad = [raw_adc_history[0]] * (15 - len(raw_adc_history))
            raw_adc_history = pad + raw_adc_history
            
        return jsonify({
            "current_cumulative_kg": float(f"{current_cumulative_sum / 1000:.2f}"), # Mock scaling factor for kg
            "predicted_midnight_kg": float(f"{predicted_final_total / 1000:.2f}"), # Mock scaling factor for kg
            "raw_adc_history": raw_adc_history
        }), 200

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("--- Flask Middleman API Started ---")
    print("Listening for NodeMCU data on port 5000...")
    # host='0.0.0.0' allows other devices on the same Wi-Fi to send data to this laptop
    app.run(host='0.0.0.0', port=5000)