# 🌍 EcoGuard - AI-Powered Carbon Intelligence Platform

![EcoGuard Banner](https://img.shields.io/badge/Status-Hackathon_Ready-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react) ![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-38B2AC?style=for-the-badge&logo=tailwind-css) ![GSAP](https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock) ![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi) ![XGBoost](https://img.shields.io/badge/XGBoost-ML_Stack-orange?style=for-the-badge) ![YOLO](https://img.shields.io/badge/YOLO-Vision_AI-yellow?style=for-the-badge)

**EcoGuard** is a highly interactive, next-generation carbon footprint calculator designed to bridge the gap between static, generic national averages and dynamic, real-world personal lifestyle impacts. Built specifically for the **SIC Hackathon**.

---

## 🏗️ Project Journey & Chronology

This project was built from the ground up during the hackathon to solve a specific problem: existing sustainability tools are boring, static, and utilize outdated national averages. To win, we engineered a mathematically rigorous, physics-informed UI combined with a state-of-the-art **Tri-Modal ML Architecture**.

### Phase 1: The Pitch Engine (Landing Page)
We started by establishing a premium, high-impact landing page that explains the problem and pitches our unique AI solution to the judges within 30 seconds.
- **Hero Hook:** Implemented an animated live-counter (`react-countup`) proving the scale of the carbon problem.
- **Scroll Physics:** Built horizontal processing nodes and branching architecture SVGs utilizing GSAP ScrollTrigger to visualize how our ML pipeline turns raw user data into clean datasets.
- **Comparative Analysis:** Embedded an interactive Recharts graph allowing users to toggle between "Generic Data" and our "Real-World Stacking Model," instantly visualizing the R² accuracy jump from 0.785 to 0.977.

### Phase 2: The Data Collection Engine (The Wizard)
To feed our highly-specific Python models, we couldn't just use a standard form. We built an immersive 5-Step Framer Motion Wizard:
1. **Personal:** Physical data points impacting metabolic and lifestyle carbon bases.
2. **Transport (High Impact ⭐):** Strict metric tracking for vehicle distance and flight frequencies.
3. **Consumption:** E-commerce delivery and grocery impacts.
4. **Energy & Waste:** Highly localized variables including screen time, boiling methods, and specific recycling schemas.
5. **Computer Vision Input:** A drag-and-drop zone to feed physical images directly to our Object Detection model.

### Phase 3: The Tri-Modal Synthesis (The Brains)
Unlike traditional calculators, EcoGuard splits the processing load across three distinct, parallel machine learning pipelines (Tabular Regression, Computer Vision, and IoT Time-Series Forecasting), aggregating them in the React UI context layer.

---

## 🚀 The Tri-Modal ML Architecture Deep-Dive

### Model 1: Lifestyle Regression (Gradient Boosting / XGBoost)
- **Purpose**: Analyzes the continuous and categorical variables of a user's daily life.
- **Input Features (18 Total)**: 
  - *Categorical*: Body Type, Sex, Diet, Transport, Vehicle Type, Flight Frequency, Heating Source, Energy Efficiency, Shower Frequency, Waste Bag Size, Recycling Arrays, Cooking Arrays.
  - *Continuous*: Vehicle Distance (Km), Grocery Bill ($), New Clothes, TV Hours, Internet Hours, Waste Bag Count.
- **Handling**: The frontend maps inputs directly to corresponding Title Cased strings required by the `.joblib` model dict.
- **Performance**: Achieves an exceptional **R² of 0.9885** (RMSE=109.4, MAE=82.1), outperforming base heuristics using a Stacking Ensemble technique.
- **Execution**: The React frontend sends a structured JSON payload via `lib/ml-api.js` to the `/predict_lifestyle` FASTAPI endpoint, instantly retrieving the baseline carbon tonnage.

### Model 2: YOLO Computer Vision
- **Purpose**: Instantly detects and categorizes unexpected physical waste materials that standard tracking forms miss.
- **Input**: Users upload a single image of their daily waste bin via the Wizard.
- **Execution**: The YOLO AI model scans the image using edge-detection to map bounding boxes around recyclables and trash. It returns a structured JSON execution log of detected materials (e.g., Plastic, Cardboard), precise confidence ratings (%), estimated physical weights (g), and their independent carbon impact calculations (kg).
- **Synthesis**: The frontend awaits the parallel Promises, integrating the YOLO prediction into the final payload.

### Real-Time Offset Calculation
To combat eco-anxiety, the final dashboard instantly calculates the exact number of mature trees (at 21.7kg CO₂ absorbed/year) required to neutralize the user's distinct Tri-Modal footprint, rendering an animated environmental goal.

### Model 3: EcoGuard SensorAI (Real-Time IoT Forecast Engine)
- **Purpose**: Transforms the platform from a static predictor into a high-fidelity, real-time live environmental monitoring system.
- **Input Features**: Live continuous readings coming from a physical **MQ-7 Gas Sensor** connected via ESP8266/NodeMCU hardware, containing the cumulative ADC sum, current hour, and day of the week.
- **Execution**: A dedicated Flask API receives the hardware's data over the `/sensor_data` endpoint, immediately appending the output to `live_sensor_today.csv`. The `daily_emission_model.joblib` regression model parses this trajectory to forecast the exact total emission at midnight.
- **Synthesis**: The React Dashboard integrates this real-time stream into a dedicated "Live Sensor Monitoring" card. Utilizing GSAP CountUp and Recharts, it plots the `Raw_ADC` values dynamically alongside the Lifestyle and Vision ML predictions, aggregating into a true Tri-Modal `Total Carbon` impact score.

---

## 🎨 Premium UI & Interactive Physics

- **GSAP ScrollTrigger**: The landing page employs complex interpolation physics. 
  - *The Process Node Line* dynamically draws itself horizontally scrubbed to the user scroll.
  - *The Architecture Diagram* utilizes animated SVG paths mapping the exact system design flow from React to the independent Dual ML containers.
- **Lenis Smooth Scrolling**: Overrides native, choppy browser scrolling with a luxurious, requestAnimationFrame-backed momentum glide (`@studio-freight/lenis`), tightly coupled with the GSAP ticker to prevent animation stuttering.
- **Responsive Data Visualization**: Feature-rich Recharts SVG Bar Charts dynamically scale to display the difference between Baseline UI tracking and YOLO Vision offsets.

---

## 🛠️ Complete Technology Stack

### Frontend Architecture
* **Core**: React 19 + Vite + ESModules
* **Styling**: Tailwind CSS v4 (Custom dark mode palette: `#111827` base, `#10b981` emerald accents)
* **Routing**: React Router DOM v7 (Hash-anchors explicitly handled via absolute routing `/#section`)
* **Icons**: Lucide React

### Animation Engine
* **Interpolation**: GSAP (GreenSock Animation Platform) + Context Hook Cleanup
* **Micro-Interactions**: Framer Motion (Page Transitons / Conditional Mounts)
* **Scroll Physics**: Studio Freight Lenis 

### Data & API
* **Visuals**: Recharts (Pie & Bar SVG rendering) & countup
* **API Bridge**: Async Promises via Native Fetch (`ml-api.js`)

---

## 💻 Local Installation & Setup

### 1. Repository Setup
```bash
git clone https://github.com/shreekant-lohagale/Code4Society.git
cd Code4Society/sic-hackathon
```

### 2. Frontend Client (React + Vite)
*Note: Ensure you are using Node.js v18+*
```bash
# Install dependencies
npm install

# Start the Vite development server on http://localhost:5173
npm run dev
```

### 3. Machine Learning API (Python + FastAPI)
*Note: Ensure you have Python 3.10+ installed. It is highly recommended to use a virtual environment.*
```bash
# Navigate to the backend directory
cd "EcoGuard Vision Engine"

# Create and activate a virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install strictly defined ML and API dependencies
pip install -r requirements.txt

# Boot the FastAPI Server on http://localhost:8000
uvicorn api:app --reload
```

### 4. Experience the App
1. Ensure the Python FastAPI server is running in one terminal.
2. Ensure the Vite React server is running in a second terminal.
3. Navigate your browser to `http://localhost:5173`. Scroll through the premium Landing Pitch to understand the architecture, then click **"Calculate Footprint"** to launch the interactive Dashboard framework.

---

## 📁 Core Directory Structure

The repository is structured to separate the high-performance React frontend from the Python Machine Learning API ecosystem.

### 1. Frontend Client (React)
```text
src/
├── components/
│   ├── calculator/        # The 5-Step Form Wizard & Results Scorecard
│   ├── layout/            # Sticky Navbar & Footer 
│   └── sections/          # The GSAP Animated Landing Page Components
├── lib/                   
│   └── ml-api.js          # The Dual-Model Promise API Aggregator
├── pages/                 
│   ├── Landing.jsx        # Landing Route (/)
│   └── AppDashboard.jsx   # Interactive Application Route (/app)
├── App.jsx                # Global Router & Lenis Physics Engine Context
└── index.css              # Global Tailwind Directives
```

### 2. Machine Learning API (FastAPI + Python)
*Note: The backend runs as a separate microservice to handle heavy tensor computations and matrix lookups without blocking the JS thread.*
```text
EcoGuard Vision Engine/    # FastAPI Backend & Computer Vision logic
├── api.py                 # FastAPI Application Entry Point (CORS mapping, routing)
├── predictor.py           # Core Inference Logic (Loads Joblib & YOLO Weights)
├── requirements.txt       # Python dependencies (fastapi, xgboost, ultralytics)
└── models/                
    └── yolo_weights.pt    # The trained computer vision object detection weights

EcoGuard Core Engine/      # XGBoost Lifestyle Model & Data Science
├── best_ml_model.joblib   # The pre-trained XGBoost Stacking Ensemble (R² 0.9885)
├── model_comp.ipynb       # Jupyter Notebook detailing model training and R² benchmarking
└── Carbon-Emission.csv    # The raw training dataset

EcoGuard IoT Sensor/       # Flask API & Real-Time Hardware Integration
├── app.py                 # Flask server receiving NodeMCU /sensor_data
├── daily_emission_model.joblib # The trained gas regression forecast model
└── live_sensor_today.csv  # The real-time appended continuous sensor dataset
```

---

## 🔮 Future Scope & Expansion
1. **Cloud Deployment**: Hosting the FastAPI Python ecosystem on AWS/GCP and deploying the React client via Vercel for instant CDN delivery.
2. **User Authentication**: Implementing secure JWT login to save historical predictions to a PostgreSQL database, allowing users to track footprint reduction over time via time-series graphs.
3. **Receipt OCR Scan**: Adding a third AI pipeline element to scan monthly grocery receipts, parsing text to extract hidden consumption metrics contextually.
