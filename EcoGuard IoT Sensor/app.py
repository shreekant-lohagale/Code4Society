# Conversts the raw data into a daily cumulative sum format, which is used for training the model.

import pandas as pd
import datetime
import joblib

# 1. Load the trained AI brain
model = joblib.load('daily_emission_model.joblib')

def predict_end_of_day_total(today_csv_file):
    """
    This function runs the exact second you click the "Predict" button.
    """
    # 2. Extract the exact current time
    now = datetime.datetime.now()
    day_of_week = now.weekday() # Monday is 0, Sunday is 6
    click_hour = now.hour
    click_minute = now.minute
    
    # 3. Read the raw sensor data dumped by the NodeMCU so far TODAY
    # (Assuming the NodeMCU saves today's data into 'live_sensor_today.csv')
    try:
        live_data = pd.read_csv(today_csv_file)
        
        # Calculate the mathematical sum of all emissions recorded since midnight
        current_cumulative_sum = live_data['Raw_ADC'].sum()
        
    except FileNotFoundError:
        print("No data collected from sensor today yet!")
        return None

    # 4. Package the data exactly how the model demands it
    ai_input = [[day_of_week, click_hour, click_minute, current_cumulative_sum]]
    
    # 5. Get the prediction
    predicted_final_total = model.predict(ai_input)[0]
    
    return predicted_final_total, current_cumulative_sum

# --- Example of what happens when you click the button ---
# predicted_total, current_sum = predict_end_of_day_total('live_sensor_today.csv')
# print(f"Gas measured so far: {current_sum}")
# print(f"AI Predicts Final Midnight Total will be: {predicted_total}")