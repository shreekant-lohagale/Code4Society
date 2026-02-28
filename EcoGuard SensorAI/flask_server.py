from flask import Flask, request, jsonify
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)
CSV_FILE = 'MQ-7 Predictions/live_sensor_today.csv'

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

if __name__ == '__main__':
    print("--- Flask Middleman API Started ---")
    print("Listening for NodeMCU data on port 5000...")
    # host='0.0.0.0' allows other devices on the same Wi-Fi to send data to this laptop
    app.run(host='0.0.0.0', port=5000)