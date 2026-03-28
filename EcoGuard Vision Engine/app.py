"""
EcoGuard - FastAPI Backend
Production-ready API server for all EcoGuard models
"""

import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import asyncio
import json
from pathlib import Path
import cv2
import numpy as np
from datetime import datetime
import uuid
import gc

from predictor import get_predictor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="EcoGuard API",
    description="AI-powered waste management and carbon tracking system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATA MODELS ====================

class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class WeightEstimateRequest(BaseModel):
    bbox: BBox
    class_name: str
    image_shape: List[int]

class CarbonCalculateRequest(BaseModel):
    weight_kg: float
    material: str

class LifestylePredictRequest(BaseModel):
    features: List[float]

# ==================== HEALTH & INFO ====================

@app.get("/")
async def root():
    return {
        "name": "EcoGuard API",
        "status": "running",
        "mode": "lazy-loading-optimized"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# ==================== VISION MODEL ====================

@app.post("/api/vision/detect")
async def detect_objects(file: UploadFile = File(...)):
    gc.collect() # Force GC before heavy AI task
    try:
        logger.info(f"Vision request: {file.filename}")
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        temp_dir = Path("/tmp")
        temp_dir.mkdir(exist_ok=True)
        temp_path = temp_dir / f"ecoguard_{uuid.uuid4()}.jpg"
        cv2.imwrite(str(temp_path), img)
        
        predictor = get_predictor()
        result = predictor.detect_objects(str(temp_path))
        
        if temp_path.exists():
            temp_path.unlink()
        
        result['image_shape'] = list(img.shape)
        return result
    except Exception as e:
        logger.error(f"Vision error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WEIGHT & CARBON ====================

@app.post("/api/weight/estimate")
async def estimate_weight(request: WeightEstimateRequest):
    try:
        predictor = get_predictor()
        return predictor.estimate_weight(
            bbox=request.bbox.dict(),
            class_name=request.class_name,
            image_shape=request.image_shape
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/carbon/calculate")
async def calculate_carbon(request: CarbonCalculateRequest):
    try:
        predictor = get_predictor()
        return predictor.calculate_carbon(
            weight_kg=request.weight_kg,
            material=request.material
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== LIFESTYLE MODEL ====================

@app.post("/api/lifestyle/predict")
async def predict_lifestyle(request: LifestylePredictRequest):
    gc.collect()
    try:
        if len(request.features) != 20:
            raise HTTPException(status_code=400, detail="Expected 20 features")
        
        predictor = get_predictor()
        return predictor.predict_lifestyle_carbon(request.features)
    except Exception as e:
        logger.error(f"Lifestyle error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    logger.info("EcoGuard API Starting (Optimized for 512MB RAM)...")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
