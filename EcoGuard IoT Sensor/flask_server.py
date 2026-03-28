# ==========================================
# 1. ALL IMPORTS
# ==========================================
import os
import json
import time
import threading
from flask import Flask, request, jsonify
from web3 import Web3
from dotenv import load_dotenv

# Import the Math/AI script logic
try:
    from app import predict_end_of_day_total
except ImportError:
    print("WARNING: Could not import app.predict_end_of_day_total. Ensure app.py is in the same directory.")

# ==========================================
# 2. FLASK APP INITIALIZATION
# ==========================================
flask_app = Flask(__name__) # Renamed to avoid shadowing app.py

# ==========================================
# 3. BLOCKCHAIN CONFIG & THREAD LOGIC
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, '.env')
ABI_PATH = os.path.join(BASE_DIR, 'CarbonFootprintLogger.json')

load_dotenv(ENV_PATH)

INFURA_URL = os.getenv("INFURA_API_KEY") 
w3 = Web3(Web3.HTTPProvider(INFURA_URL))

# Ensure connection
if w3.is_connected():
    print("✅ Connected to Ethereum Sepolia via RPC")
else:
    print("❌ Failed to connect to Web3 Provider")

CONTRACT_ADDRESS = Web3.to_checksum_address("0x72FF4FdA69117A69864B39AD9Ece10e67d86CF98")
PRIVATE_KEY = os.getenv("PRIVATE_KEY") 
ACCOUNT_ADDRESS = w3.eth.account.from_key(PRIVATE_KEY).address if getattr(w3.eth, 'account', None) else None

# Load ABI safely
abi = None
if os.path.exists(ABI_PATH):
    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
else:
    print("⚠️ Missing CarbonFootprintLogger.json ABI file!")

def blockchain_sync_loop():
    print("--- 🔗 AI Blockchain Sync Thread Started ---")
    while True:
        try:
            # Sleep first to avoid racing
            time.sleep(120) 
            
            csv_path = os.path.join(BASE_DIR, 'live_sensor_today.csv')
            
            # Predict the FINAL carbon layout 
            predicted_total, current_sum = predict_end_of_day_total(csv_path)
            
            if predicted_total is not None:
                # Truncate the float to an integer for the Smart Contract
                final_uint256 = int(predicted_total)
                
                print(f"[Web3] Syncing Final Predicted Estimation: {final_uint256} to Sepolia...")
                
                nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS)
                txn = contract.functions.logData(final_uint256).build_transaction({
                    'chainId': 11155111,
                    'gas': 300000, 
                    'maxFeePerGas': w3.eth.gas_price,
                    'maxPriorityFeePerGas': w3.eth.max_priority_fee,
                    'nonce': nonce,
                })

                signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
                tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
                
                print(f"[Web3] Success! TX Hash: https://sepolia.etherscan.io/tx/{w3.to_hex(tx_hash)}")
            else:
                print("[Web3] Waiting for valid AI predictions...")
                
        except Exception as e:
            print(f"[Web3] Blockchain Sync Error: {e}")

# START THE THREAD ONLY IF WEB3 LOADED PROPERLY
if PRIVATE_KEY and abi:
    threading.Thread(target=blockchain_sync_loop, daemon=True).start()

# ==========================================
# 4. YOUR EXISTING FLASK ROUTES
# ==========================================
@flask_app.route('/sensor_data', methods=['POST'])
def sensor_data():
    try:
        # 1. Grab the JSON payload sent by the NodeMCU
        data = request.get_json()

        # 2. Extract the values (fallback to 0 if something is missing)
        raw_adc = data.get('Raw_ADC', 0)
        node_volts = data.get('NodeMCU_Volts', 0.0)
        sensor_volts = data.get('Sensor_Volts', 0.0)

        # 3. Generate a current timestamp
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')

        # 4. Append to your local CSV
        csv_path = os.path.join(BASE_DIR, 'live_sensor_today.csv')
        file_exists = os.path.isfile(csv_path)
        
        with open(csv_path, 'a') as f:
            # Write headers if the file was just created
            if not file_exists:
                f.write("Timestamp,Raw_ADC,NodeMCU_Volts,Sensor_Volts\n")
            # Write the actual data
            f.write(f"{timestamp},{raw_adc},{node_volts},{sensor_volts}\n")

        # 5. Tell the NodeMCU it was successful
        return jsonify({"status": "success", "message": "Data logged to CSV"}), 200

    except Exception as e:
        print(f"Route Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@flask_app.route('/prediction', methods=['GET'])
def get_prediction():
    """ 
    Exposes the same backend calculation to the React frontend dash.
    """
    csv_path = os.path.join(BASE_DIR, 'live_sensor_today.csv')
    try:
        predicted_total, current_sum = predict_end_of_day_total(csv_path)
        if predicted_total is not None:
            return jsonify({
                "status": "success", 
                "predicted_total": int(predicted_total),
                "current_sum": float(current_sum)
            }), 200
        else:
            return jsonify({"status": "error", "message": "No data returned from AI"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 5. THE SERVER IGNITION (Do not miss this)
# ==========================================
if __name__ == '__main__':
    # host='0.0.0.0' allows your NodeMCU to connect over Wi-Fi.
    flask_app.run(host='0.0.0.0', port=5000, debug=False)