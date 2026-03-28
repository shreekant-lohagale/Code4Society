/**
 * EcoGuard ML API Integration
 * Connects the frontend to the FastAPI AI Engine on Render.
 * Aligned with the Frontend Integration Guide 🎨
 */

const API_BASE_URL = 'https://ecoguard-mlops.onrender.com';
const API_TIMEOUT = 15000; // 15 seconds to prevent "stuck" loading

/**
 * Helper to wrap fetch with a timeout using AbortController
 */
const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = API_TIMEOUT } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

/**
 * Pipeline 1: Regression Model (Lifestyle Data)
 * Expected Endpoint: POST /api/lifestyle/predict
 * Body: { "features": [0.0 - 1.0, ...] } (20 normalized floats)
 */
export const predictLifestyle = async (formData) => {
    console.log("Pipeline 1 -> Starting Lifestyle Prediction...");

    try {
        // Normalization Mappings (Converting categories to 0.0-1.0 range)
        const mappings = {
            bodyType: { "underweight": 0, "normal": 0.33, "overweight": 0.66, "obese": 1.0 },
            sex: { "female": 0, "male": 1.0 },
            diet: { "vegan": 0, "vegetarian": 0.33, "pescatarian": 0.66, "omnivore": 1.0 },
            shower: { "less frequently": 0, "daily": 0.33, "twice a day": 0.66, "more frequently": 1.0 },
            heating: { "electricity": 0, "natural gas": 0.33, "wood": 0.66, "coal": 1.0 },
            transport: { "walk/bicycle": 0, "public": 0.5, "private": 1.0 },
            vehicle: { "none": 0, "electric": 0.2, "hybrid": 0.4, "petrol": 0.6, "diesel": 0.8, "lpg": 1.0 },
            social: { "never": 0, "sometimes": 0.5, "often": 1.0 },
            airTravel: { "never": 0, "rarely": 0.33, "frequently": 0.66, "very frequently": 1.0 },
            wasteSize: { "small": 0, "medium": 0.33, "large": 0.66, "extra large": 1.0 },
            efficiency: { "No": 0, "Sometimes": 0.5, "Yes": 1.0 }
        };

        const features = [
            mappings.bodyType[formData["Body Type"]?.toLowerCase()] || 0.33,
            mappings.sex[formData["Sex"]?.toLowerCase()] || 0,
            mappings.diet[formData["Diet"]?.toLowerCase()] || 1,
            mappings.shower[formData["How Often Shower"]?.toLowerCase()] || 0.33,
            mappings.heating[formData["Heating Energy Source"]?.toLowerCase()] || 0,
            mappings.transport[formData["Transport"]?.toLowerCase()] || 0.5,
            mappings.vehicle[formData["Vehicle Type"]?.toLowerCase()] || 0,
            mappings.social["sometimes"], 
            Math.min(1.0, (parseFloat(formData["Monthly Grocery Bill"]) || 0) / 1000),
            mappings.airTravel[formData["Frequency of Traveling by Air"]?.toLowerCase()] || 0,
            Math.min(1.0, (parseFloat(formData["Vehicle Monthly Distance Km"]) || 0) / 1000), 
            mappings.wasteSize[formData["Waste Bag Size"]?.toLowerCase()] || 0.33,
            Math.min(1.0, (parseFloat(formData["Waste Bag Weekly Count"]) || 0) / 10),
            Math.min(1.0, (parseFloat(formData["How Long TV PC Daily Hour"]) || 0) / 24),
            Math.min(1.0, (parseFloat(formData["How Many New Clothes Monthly"]) || 0) / 10),
            Math.min(1.0, (parseFloat(formData["How Long Internet Daily Hour"]) || 0) / 24),
            mappings.efficiency[formData["Energy efficiency"]] || 0.5,
            Math.min(1.0, (formData["Recycling"]?.length || 0) / 5),
            Math.min(1.0, (formData["Cooking_With"]?.length || 0) / 5),
            0 
        ];

        const response = await fetchWithTimeout(`${API_BASE_URL}/api/lifestyle/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        
        console.log("Pipeline 1 -> Lifestyle Prediction Success");
        return {
            lifestyle_carbon: data.monthly_carbon_kg,
            yearly_carbon: data.yearly_carbon_kg,
            recommendation: data.recommendation,
            compared_to_average: data.compared_to_average_percent
        };

    } catch (error) {
        console.warn("Lifestyle Prediction API Failed or Timed Out, using local fallback:", error);
        
        let emission = 1500;
        if (formData["Transport"] === "private") {
            if (formData["Vehicle Type"] === "petrol") emission += (formData["Vehicle Monthly Distance Km"] * 0.25);
            if (formData["Vehicle Type"] === "diesel") emission += (formData["Vehicle Monthly Distance Km"] * 0.28);
            if (formData["Vehicle Type"] === "electric") emission += (formData["Vehicle Monthly Distance Km"] * 0.08);
        } else if (formData["Transport"] === "public") {
            emission += (formData["Vehicle Monthly Distance Km"] * 0.05);
        }

        const airTravelMap = { "never": 0, "rarely": 400, "frequently": 1500, "very frequently": 3500 };
        emission += airTravelMap[formData["Frequency of Traveling by Air"]] || 0;

        const dietMap = { "vegan": -300, "vegetarian": -150, "pescatarian": 0, "omnivore": 300 };
        emission += dietMap[formData["Diet"]] || 0;

        emission += (formData["Monthly Grocery Bill"] * 1.5);
        emission += (formData["How Many New Clothes Monthly"] * 25);

        const wasteSizeMap = { "small": 1, "medium": 1.5, "large": 2, "extra large": 2.5 };
        const wasteFactor = wasteSizeMap[formData["Waste Bag Size"]] || 1.5;
        emission += (formData["Waste Bag Weekly Count"] * wasteFactor * 4); 

        return {
            lifestyle_carbon: Math.max(0, Math.round(emission)),
            error: true,
            isFallback: true
        };
    }
};

/**
 * Pipeline 2: Computer Vision Model (Waste Items)
 */
export const predictImage = async (imageFile) => {
    if (!imageFile) return [];
    console.log("Pipeline 2 -> Starting Vision Analysis...");

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetchWithTimeout(`${API_BASE_URL}/api/vision/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Vision Analyze API Error: ${response.status}`);
        const data = await response.json();
        
        console.log("Pipeline 2 -> Vision Analysis Success");
        const detections = data.detections || [];
        return detections.map(det => ({
            material: det.class_name,
            confidence: det.confidence,
            bbox: det.bbox,
            weight_g: det.weight_g,
            carbon_g: det.carbon_g,
            carbon_kg: det.carbon_g / 1000,
            size_category: det.size_category
        }));

    } catch (error) {
        console.warn("Vision Analyze API Failed or Timed Out, using mock fallback:", error);
        return [
            { material: "plastic", confidence: 0.97, weight_g: 82.9, carbon_kg: 0.207, carbon_g: 207, size_category: "Medium" },
            { material: "cardboard", confidence: 0.89, weight_g: 150.5, carbon_kg: 0.135, carbon_g: 135, size_category: "Medium" }
        ];
    }
};

/**
 * Pipeline 3: IoT SensorAI Forecast Engine
 */
export const predictSensorData = async () => {
    try {
        const response = await fetchWithTimeout('https://ecoguard-iot.onrender.com/api/sensor_data');
        if (response.ok) return await response.json();
    } catch (error) {
        console.warn("IoT API unreachable or timed out, using mock trajectory...");
    }

    const currentHour = new Date().getHours() || 12;
    const current_cumulative_kg = parseFloat((currentHour * 0.45).toFixed(2));
    const variance = (Math.random() * 1.5).toFixed(2);
    const predicted_midnight_kg = parseFloat((10.8 + parseFloat(variance)).toFixed(2));
    const raw_adc_history = [120, 145, 110, 160, 130, 140, 155, 125, 135, 150, 145, 130, 120, 115, 140];

    return {
        current_cumulative_kg,
        predicted_midnight_kg,
        raw_adc_history
    };
};
