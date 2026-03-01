# 🌍 EcoGuard - AI-Powered Carbon Intelligence Platform

<div align="center">

![EcoGuard Banner](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) 
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react) 
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite) 
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-38B2AC?style=for-the-badge&logo=tailwind-css) 
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python) 
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi) 
![XGBoost](https://img.shields.io/badge/ML-XGBoost-orange?style=for-the-badge) 
![YOLO](https://img.shields.io/badge/Vision_AI-YOLOv8-yellow?style=for-the-badge)

**EcoGuard** bridges the gap between static, generic national averages and dynamic, real-world personal carbon footprint impacts. Powered by a **Tri-Modal ML Architecture**, it combines lifestyle analysis, computer vision waste detection, and real-time IoT sensor monitoring.

[🚀 Live Demo](#local-installation) • [📚 Documentation](./REPORT.md) • [🏗️ Architecture](#-tri-modal-ml-architecture) • [📦 Models](#-machine-learning-models)

</div>

---

## 🎯 Problem Statement

- **Scale**: Urban commuters contribute 25-30% of daily CO2 emissions
- **Challenge**: Existing carbon calculators rely on outdated national averages and generic assumptions
- **Gap**: No tool provides real-time, personalized, physics-informed carbon footprint predictions
- **Solution**: EcoGuard combines ML regression, computer vision, and IoT sensors for comprehensive environmental impact analysis

---

## ✨ Key Features

### 🧠 Tri-Modal ML Architecture
- **Lifestyle Regression**: Predicts carbon from 18 lifestyle variables (98% accuracy)
- **Computer Vision**: YOLOv8 waste detection + automated carbon calculation
- **IoT Monitoring**: Real-time gas sensor integration for live tracking

### 🎨 Premium Interactive UI
- Animated landing page with GSAP ScrollTrigger physics
- 5-Step form wizard with Framer Motion transitions
- Real-time dashboard with Recharts data visualization
- Luxurious scroll physics using Lenis smooth scrolling
- Dark mode with emerald accents

### 📊 Advanced Analytics
- Side-by-side comparison: Generic vs. Real-World ML predictions
- Per-category breakdown (Transport, Energy, Waste, Consumption)
- Tree offset calculation (21.7kg CO₂/year per mature tree)
- Cross-validation verified models (R² = 0.9800+)

---

## 🏗️ Project Architecture

<div align="center">
  <img width="454" height="711" alt="image" src="https://github.com/user-attachments/assets/a2a134db-d332-4918-bce3-2fafe0c5ae9c" />
</div>

---

## 🔬 Machine Learning Models

### Model 1: Lifestyle Carbon Regression

**Overview**
- **Type:** Tabular Regression using Stacking Ensemble
- **Input Features:** 18 lifestyle variables
- **Performance:** R² = 0.9800+ (98% accuracy)
- **Framework:** XGBoost, LightGBM, CatBoost

**Architecture**
```
Base Learners (L0):
├── LightGBM (n_estimators=1500, learning_rate=0.01)
├── CatBoost (iterations=2000, learning_rate=0.01)
└── HistGradientBoosting (max_iter=800)

Meta-Learner (L1):
└── Ridge Regression (α=1.0)
```

**Input Features (18 Total)**

| Category | Features |
|----------|----------|
| **Transportation** | Vehicle Type, Vehicle Distance (km/month), Transport Mode, Flight Frequency |
| **Energy** | Heating Source, Energy Efficiency Rating, AC/Heating Usage |
| **Consumption** | Grocery Bill ($), New Clothes/Month, Diet Type |
| **Utilities** | TV/PC Hours/Day, Internet Hours/Day, Shower Frequency |
| **Waste** | Waste Bag Size, Waste Bag Count/Week, Recycling (Yes/No) |
| **Demographics** | Body Type, Sex, Social Activity Frequency |

**Performance Metrics**
```
Test Set Performance (20% Hold-out):
├─ R² Score:           0.9800+
├─ RMSE:               2.7 kg CO2
├─ MAE:                2.1 kg CO2
└─ Cross-Validation:   0.9799 ± 0.0008 (5-Fold)

Model Ranking:
  Rank 1: Stacking Ensemble   R² = 0.9800+ ★ BEST
  Rank 2: LightGBM            R² = 0.9785
  Rank 3: CatBoost            R² = 0.9780
  Rank 4: XGBoost             R² = 0.9770
```

**Top Predictive Features**
1. Vehicle Monthly Distance (km) - Transportation 🚗
2. Heating Energy Source - Energy consumption 🔥
3. Monthly Grocery Bill - Food production 🛒
4. How Often Shower - Water heating 💧
5. Energy Efficiency Rating - Building performance 🏠

**File:** `best_ml_model.joblib` (50 MB)

### Model 2: Waste Detection & Carbon Estimation

**Overview**
- **Type:** Object Detection using YOLOv8 Nano + Weight Estimation
- **Input:** JPG/PNG images (416×416 px)
- **Output:** Material class + confidence + weight + carbon
- **Performance:** mAP50 = 96.00%, Precision = 91.98%

**Dataset**
- **Total Images:** 1,800+ waste samples
- **Classes:** 6 material types (Cardboard, Glass, Metal, Paper, Plastic, Trash)
- **Split:** 80% Train (1,440) / 20% Validation (360)
- **Augmentation:** HSV jittering, rotation, horizontal/vertical flips, mixup, copy-paste

**Architecture**
```
YOLOv8 Nano (Lightweight)
├── Backbone: CSPDarknet (3.2M params)
├── Neck: PAN (Path Aggregation Network)
└── Head: Decoupled Detection

Model Size:  5.9 MB (edge-deployment ready)
Inference:   2.4 ms per image (GPU)
Precision:   FP16 (Automatic Mixed Precision)
```

**Carbon Emission Factors**

| Material | CO2 (kg/kg) | Density | Impact |
|----------|-----------|---------|--------|
| **Metal** | 8.5 | 1.50 | 🔴🔴 HIGHEST |
| **Plastic** | 2.5 | 0.20 | 🔴 HIGH |
| **Trash** | 2.0 | 0.50 | 🟡 MEDIUM |
| **Paper** | 1.3 | 0.15 | 🟡 MEDIUM |
| **Glass** | 1.2 | 1.20 | 🟡 MEDIUM |
| **Cardboard** | 1.1 | 0.40 | 🟡 MEDIUM |

**Weight Formula**
```
Estimated_Weight_g = Normalized_Area × 500g × Density[material]
Carbon_kg = (Weight_g / 1000) × EMISSION_FACTOR[material]
```

**Per-Class Performance**
```
Material     Precision  Recall   F1-Score
─────────────────────────────────────────
Metal        98.9%      88.9%    0.938
Paper        97.7%      87.8%    0.925
Cardboard    97.7%      88.8%    0.928
Glass        96.6%      87.6%    0.916
Plastic      92.1%      88.2%    0.901
Trash        90.8%      85.9%    0.883
```

**Export Formats**
| Format | Size | Use Case | Speed |
|--------|------|----------|-------|
| PyTorch (.pt) | 5.9 MB | Full precision GPU | 2.4 ms |
| ONNX | 5.7 MB | Cross-platform | 3-5 ms |
| TorchScript | 5.8 MB | C++ integration | 2.5 ms |

**Files:**
- `best.pt` - YOLOv8 detection model
- `weight_stacking_model.pkl` - Weight prediction (R² = 0.94-0.96)
- `material_encoder.pkl` - Label encoder

### Model 3: Real-Time IoT Sensor Monitoring

**Overview**
- **Type:** Time-Series Regression with Live Data Stream
- **Hardware:** ESP8266/NodeMCU + MQ-7 CO2 Gas Sensor
- **Input Features:** ADC readings, hour, day of week
- **Output:** Real-time emission forecast + daily total prediction

**Execution Flow**
```
Hardware (ESP8266)
    │
    ▼
POST /sensor_data
    │
    ▼
Flask API
    │
    ├─ Append to live_sensor_today.csv
    ├─ Parse trajectory
    └─ Run regression
    │
    ▼
daily_emission_model.joblib
    │
    ▼
JSON Response (predicted total @ midnight)
    │
    ▼
React Dashboard (Real-time Chart)
```

**Performance**
- Real-time dashboard updates
- Continuous CSV logging for historical analysis
- Predictive forecasting for 24-hour emissions

**Files:**
- `app.py` - Flask sensor API
- `daily_emission_model.joblib` - Time-series regression
- `live_sensor_today.csv` - Live data stream

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js** v18+ (for frontend)
- **Python** 3.10+ (for backend)
- **npm** or **yarn** (package manager)
- **Git** (for cloning)

### 1. Clone Repository
```bash
git clone https://github.com/shreekant-lohagale/Code4Society.git
cd Code4Society/sic-hackathon
```

### 2. Frontend Setup (React + Vite)

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# The frontend will be available at http://localhost:5173
```

**Frontend Stack:**
- React 19 with Vite
- Tailwind CSS v4
- GSAP for animations
- Framer Motion for UI transitions
- Lenis for smooth scrolling
- Recharts for data visualization

### 3. Backend Setup (FastAPI + Python)

```bash
# Navigate to backend directory
cd "EcoGuard Vision Engine"

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn api:app --reload

# Server will run at http://localhost:8000
# API docs: http://localhost:8000/docs
```

**Backend Stack:**
- FastAPI 0.104+
- XGBoost, LightGBM, CatBoost
- Ultralytics YOLO
- Pydantic for data validation

### 4. IoT Sensor Setup (Optional)

```bash
# Navigate to IoT backend
cd "EcoGuard IoT Sensor"

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install flask pandas scikit-learn joblib

# Start Flask sensor API
python app.py

# Sensor API will run at http://localhost:5000
```

### 5. Run Full Stack

**Terminal 1: FastAPI Backend**
```bash
cd "EcoGuard Vision Engine"
venv\Scripts\activate  # Windows
python -m uvicorn api:app --reload
```

**Terminal 2: Flask IoT Backend** (Optional)
```bash
cd "EcoGuard IoT Sensor"
venv\Scripts\activate  # Windows
python app.py
```

**Terminal 3: React Frontend**
```bash
npm run dev
```

**Access the application at:** `http://localhost:5173`

---

## 📁 Project Structure

```
EcoGuard/
│
├── sic-hackathon/                          # Main React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── calculator/                 # 5-Step Wizard & Results
│   │   │   ├── layout/                     # Navbar & Footer
│   │   │   └── sections/                   # Landing Page Components
│   │   ├── lib/
│   │   │   └── ml-api.js                   # API aggregator for ML models
│   │   ├── pages/
│   │   │   ├── Landing.jsx                 # Landing route (/)
│   │   │   └── AppDashboard.jsx            # App route (/app)
│   │   ├── App.jsx                         # Router & Lenis context
│   │   ├── index.css                       # Tailwind directives
│   │   └── main.jsx                        # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── EcoGuard Core Engine/                   # ML Model Training
│   ├── model_comp.ipynb                    # Regression model training
│   ├── best_ml_model.joblib                # Trained model (50 MB)
│   ├── Carbon-Emission.csv                 # Training dataset (10k records)
│   ├── SIC/                                # SIC-specific training
│   └── runs/detect/train/weights/          # YOLO training outputs
│
├── EcoGuard Vision Engine/                 # FastAPI Computer Vision
│   ├── api.py                              # FastAPI application
│   ├── predictor.py                        # YOLO + Weight prediction
│   ├── requirements.txt                    # Python dependencies
│   ├── models/
│   │   └── yolo_weights.pt                 # YOLO model weights
│   └── yolov8.ipynb                        # CV model training & analysis
│
├── EcoGuard IoT Sensor/                    # Flask Real-time Monitoring
│   ├── app.py                              # Flask sensor API
│   ├── daily_emission_model.joblib         # Time-series model
│   ├── live_sensor_today.csv               # Real-time data log
│   └── model.ipynb                         # Sensor model training
│
├── REPORT.md                               # Comprehensive technical documentation
├── SUMMARY.txt                             # Executive summary
└── README.md                               # This file
```

---

## 🚀 Quick Start Guide

### 1. First-Time Setup (5 minutes)
```bash
# Clone & install frontend
git clone <repo-url>
cd sic-hackathon
npm install
npm run dev    # ✓ Frontend ready

# In another terminal, start backend
cd ../EcoGuard\ Vision\ Engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn api:app --reload    # ✓ Backend ready
```

### 2. Using the Application

1. **Open** `http://localhost:5173` in your browser
2. **Click** "Calculate Footprint" button
3. **Fill out** 5-step wizard:
   - Personal data (height, weight, age)
   - Transportation (vehicle type, km/month)
   - Consumption (grocery bill, clothing)
   - Energy & Waste (heating, shower frequency)
   - Upload waste image (optional)
4. **See results** with:
   - Total carbon footprint (kg CO2/year)
   - Category breakdown (Transport 57%, Energy 29%, etc.)
   - Trees needed to offset (at 21.7 kg CO2/tree/year)
   - Recommendations for reduction

### 3. API Testing

**Lifestyle Prediction:**
```bash
curl -X POST http://localhost:8000/predict_lifestyle \
  -H "Content-Type: application/json" \
  -d '{
    "body_type": "average",
    "vehicle_distance_km": 2000,
    "heatingenergysource": "natural gas",
    ...
  }'
```

**Waste Detection:**
```bash
curl -X POST http://localhost:8000/detect_waste \
  -F "file=@waste_image.jpg"
```

---

## 📊 Performance Benchmarks

### Regression Model
| Metric | Value | Notes |
|--------|-------|-------|
| **Accuracy (R²)** | 0.9800+ | 98% variance explained |
| **RMSE** | 2.7 kg CO2 | Root mean squared error |
| **MAE** | 2.1 kg CO2 | Mean absolute error |
| **Inference Time** | <100ms | Single prediction |
| **Cross-Val (5-Fold)** | 0.9799 ± 0.0008 | Highly consistent |

### Computer Vision Model
| Metric | Value | Notes |
|--------|-------|-------|
| **mAP50** | 96.00% | Object detection accuracy |
| **Precision** | 91.98% | Few false positives |
| **Recall** | 88.82% | Catches most objects |
| **Inference Time** | 2.4 ms | GPU (RTX 3050) |
| **Model Size** | 5.9 MB | Edge deployment ready |

---

## 🎨 UI/UX Features

### Landing Page
- **Hero Section**: Animated live carbon counter (GSAP CountUp)
- **Process Visualization**: Horizontal scroll-triggered node diagram (GSAP ScrollTrigger)
- **Architecture SVG**: Dynamic system flow visualization
- **Comparative Graph**: Toggle between generic vs. ML predictions
- **Smooth Scrolling**: Luxurious momentum scroll (Lenis)

### Calculator Wizard
- **5-Step Form**: Framer Motion page transitions
- **Form Validation**: Real-time input checking
- **Progress Bar**: Visual feedback on completion
- **Image Upload**: Drag-and-drop waste photo area
- **Loading States**: Skeleton screens during ML prediction

### Results Dashboard
- **Aggregate Score**: Large, animated CO2 total (GSAP CountUp)
- **Pie Charts**: Recharts breakdown by category
- **Bar Charts**: Comparison of lifestyle vs. ML predictions
- **Tree Counter**: Visual representation of offset trees needed
- **Export Options**: Download report as PDF

---

## 🔌 API Endpoints

### FastAPI (Port 8000)

**POST `/predict_lifestyle`**
- Predicts carbon from lifestyle features
- Returns: `{carbon_kg: number, breakdown: {...}, features_used: [...]}`

**POST `/detect_waste`**
- Detects waste materials in image
- Returns: `{materials: [...], weights: [...], carbon: number}`

**POST `/integrated_analysis`**
- Combines lifestyle + waste predictions
- Returns: `{total_carbon: number, lifestyle_carbon: number, waste_carbon: number, breakdown: {...}}`

**GET `/docs`**
- Interactive API documentation (Swagger UI)

### Flask IoT (Port 5000)

**POST `/sensor_data`**
- Receives real-time sensor readings
- Stores in CSV and predicts daily total
- Returns: `{predicted_total: number, current_reading: number}`

**GET `/sensor_status`**
- Returns current sensor status and today's data

---

## 🧪 Testing

### Frontend Tests
```bash
npm run test              # Run Jest tests
npm run test:coverage     # Coverage report
```

### Backend Tests
```bash
cd "EcoGuard Vision Engine"
pytest                    # Run pytest suite
pytest --cov             # Coverage report
```

---

## 🚢 Deployment

### Deploy Frontend (Vercel)
```bash
npm install -g vercel
vercel

# Or connect GitHub repo to Vercel dashboard
# Environment: Node.js 18+
# Build: npm run build
# Output: dist/
```

### Deploy Backend (AWS/GCP)

**AWS EC2:**
```bash
# Create instance, SSH in
ssh -i key.pem ubuntu@instance.com

# Clone repo & setup
git clone <repo>
cd EcoGuard\ Vision\ Engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start with gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 api:app
```

**Google Cloud Run:**
```bash
# Ensure Dockerfile exists
gcloud run deploy ecoguard-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📈 Model Comparison

| Aspect | Regression | Computer Vision | IoT Sensor |
|--------|-----------|-----------------|-----------|
| **Input** | 18 lifestyle features | JPG/PNG images | Real-time ADC |
| **Output** | Annual CO2 (kg) | Material + Carbon | Daily forecast |
| **Accuracy** | R² = 0.9800+ | mAP50 = 96% | Time-series fit |
| **Speed** | <100ms | 2.4ms (GPU) | Real-time |
| **Size** | 50 MB | 5.9 MB | 10 MB |
| **Deployment** | Cloud / Edge | Edge / Cloud | IoT Device |

---

## 🎓 Model Training & Evaluation

### Regression Model Training
See `EcoGuard Core Engine/model_comp.ipynb` for:
- Data loading & EDA
- Feature engineering & physics-informed features
- Model benchmarking (8 algorithms)
- Hyperparameter tuning
- Cross-validation results
- Ablation studies
- SHAP explainability

### Computer Vision Training
See `EcoGuard Vision Engine/yolov8.ipynb` for:
- Dataset preparation & annotation
- YOLO model training pipeline
- Augmentation strategies
- Per-class performance analysis
- Model export & optimization
- Edge deployment setup

---

## 📚 Documentation

- **[REPORT.md](./REPORT.md)** - Comprehensive 400+ section technical documentation
- **[SUMMARY.txt](./SUMMARY.txt)** - Executive summary (7-8 pages)
- **[ML/README.md](./ML/README.md)** - API server documentation
- **API Docs** - http://localhost:8000/docs (interactive Swagger UI)
- **Jupyter Notebooks** - Detailed model training & analysis

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Areas
- 🎨 UI/UX improvements
- 🤖 Model accuracy enhancements
- 🔌 API optimization
- 📱 Mobile app development
- 🌐 Internationalization
- 📊 Additional metrics & analytics

---

## 🐛 Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill process on Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

**CORS errors:**
- Ensure FastAPI is running with CORS enabled
- Check `api.py` for CORS middleware configuration

**YOLO model not found:**
- Download model: `python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"`

### Backend Issues

**Import errors (FastAPI):**
```bash
pip install -r requirements.txt --force-reinstall
```

**CUDA/GPU issues:**
```bash
# Force CPU inference
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
```

**Port 8000 in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8000
kill -9 <PID>
```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hackathon Organizers**: SIC Hackathon committee
- **ML Frameworks**: XGBoost, LightGBM, CatBoost, Ultralytics YOLO
- **Frontend Libraries**: React, Vite, GSAP, Framer Motion, Tailwind CSS
- **Data Sources**: Carbon-Emission dataset, TrashNet waste images
- **Team**: AI/ML engineers, Full-stack developers, UI/UX designers

---

## 📞 Contact & Support

**Project Lead**: AI Development Team  
**Email**: support@ecoguard.ai  
**GitHub Issues**: [Report bugs here](https://github.com/shreekant-lohagale/Code4Society/issues)

### Quick Links
- 🌐 [Website](https://ecoguard.ai)
- 📊 [Technical Report](./REPORT.md)
- 📋 [Executive Summary](./SUMMARY.txt)
- 🐛 [Issue Tracker](https://github.com/shreekant-lohagale/Code4Society/issues)
- 💬 [Discussions](https://github.com/shreekant-lohagale/Code4Society/discussions)

---

<div align="center">

### 🌱 Let's Build a Sustainable Future Together!

**Made with ❤️ for the SIC Hackathon**

[⬆ Back to Top](#-ecoguard---ai-powered-carbon-intelligence-platform)

</div>