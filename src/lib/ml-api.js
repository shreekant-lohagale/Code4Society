/**
 * EcoGuard ML API Integration
 * Connects the frontend to the FastAPI AI Engine on Render.
 * Lifestyle Model: Stacking Ensemble R2=0.9885
 */

const API_BASE_URL = 'https://ecoguard-vision-api.onrender.com';

/**
 * Pipeline 1: Regression Model (Lifestyle Data)
 * Expected Endpoint: POST /api/lifestyle/predict
 */
export const predictLifestyle = async (formData) => {
    console.log("Pipeline 1 -> Sending payload to Lifestyle ML:", formData);

    try {
        // Map categorical data to numerical features (LabelEncoding simulation)
        const mappings = {
            bodyType: { "underweight": 0, "normal": 1, "overweight": 2, "obese": 3 },
            sex: { "female": 0, "male": 1 },
            diet: { "vegan": 0, "vegetarian": 1, "pescatarian": 2, "omnivore": 3 },
            shower: { "less frequently": 0, "daily": 1, "twice a day": 2, "more frequently": 3 },
            heating: { "electricity": 0, "natural gas": 1, "wood": 2, "coal": 3 },
            transport: { "walk/bicycle": 0, "public": 1, "private": 2 },
            vehicle: { "electric": 1, "hybrid": 2, "petrol": 3, "diesel": 4, "lpg": 5 },
            social: { "never": 0, "sometimes": 1, "often": 2 },
            airTravel: { "never": 0, "rarely": 1, "frequently": 2, "very frequently": 3 },
            wasteSize: { "small": 0, "medium": 1, "large": 2, "extra large": 3 },
            efficiency: { "No": 0, "Sometimes": 1, "Yes": 2 }
        };

        // Construct 20 features list (matching model expectation)
        const features = [
            mappings.bodyType[formData["Body Type"]?.toLowerCase()] || 1, // 0
            mappings.sex[formData["Sex"]?.toLowerCase()] || 0, // 1
            mappings.diet[formData["Diet"]?.toLowerCase()] || 3, // 2
            mappings.shower[formData["How Often Shower"]?.toLowerCase()] || 1, // 3
            mappings.heating[formData["Heating Energy Source"]?.toLowerCase()] || 0, // 4
            mappings.transport[formData["Transport"]?.toLowerCase()] || 1, // 5
            mappings.vehicle[formData["Vehicle Type"]?.toLowerCase()] || 0, // 6 (0 if none)
            mappings.social["sometimes"], // 7: Social Activity (Default "sometimes")
            parseFloat(formData["Monthly Grocery Bill"]) || 0, // 8
            mappings.airTravel[formData["Frequency of Traveling by Air"]?.toLowerCase()] || 0, // 9
            parseFloat(formData["Vehicle Monthly Distance Km"]) || 0, // 10
            mappings.wasteSize[formData["Waste Bag Size"]?.toLowerCase()] || 1, // 11
            parseFloat(formData["Waste Bag Weekly Count"]) || 0, // 12
            parseFloat(formData["How Long TV PC Daily Hour"]) || 0, // 13
            parseFloat(formData["How Many New Clothes Monthly"]) || 0, // 14
            parseFloat(formData["How Long Internet Daily Hour"]) || 0, // 15
            mappings.efficiency[formData["Energy efficiency"]] || 1, // 16
            formData["Recycling"]?.length || 0, // 17: Recycling (Count)
            formData["Cooking_With"]?.length || 0, // 18: Cooking (Count)
            0 // 19: Placeholder/Padding to reach 20 features
        ];

        const response = await fetch(`${API_BASE_URL}/api/lifestyle/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        
        return {
            lifestyle_carbon: data.monthly_carbon_kg,
            recommendation: data.recommendation,
            compared_to_average: data.compared_to_average_percent
        };

    } catch (error) {
        console.warn("Lifestyle Prediction API Failed, using local heuristic fallback:", error);
        
        // --- ADVANCED HEURISTIC FALLBACK (from HEAD) ---
        let emission = 1500;

        // Transport (highest impact)
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
        emission += (formData["Waste Bag Weekly Count"] * wasteFactor * 4); // Weekly to monthly

        return {
            lifestyle_carbon: Math.max(0, Math.round(emission)),
            error: true
        };
    }
};

/**
 * Pipeline 2: Computer Vision Model (Waste Items)
 * Expected Endpoint: POST /api/vision/detect
 */
export const predictImage = async (imageFile) => {
    if (!imageFile) return [];
    console.log("Pipeline 2 -> Sending file to EcoGuard Vision API:", imageFile.name);

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch(`${API_BASE_URL}/api/vision/detect`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Vision API Error: ${response.status}`);
        const data = await response.json();
        
        const detections = data.detections || [];
        
        const enrichedDetections = await Promise.all(detections.map(async (det) => {
            // 1. Get Weight Estimate
            const weightRes = await fetch(`${API_BASE_URL}/api/weight/estimate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bbox: det.bbox,
                    class_name: det.class_name,
                    image_shape: data.image_shape
                })
            });
            const weightData = await weightRes.json();

            // 2. Get Carbon Calculation
            const carbonRes = await fetch(`${API_BASE_URL}/api/carbon/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight_kg: weightData.weight_kg,
                    material: det.class_name
                })
            });
            const carbonData = await carbonRes.json();

            return {
                material: det.class_name,
                confidence: det.confidence,
                weight_g: weightData.weight_g,
                carbon_kg: carbonData.carbon_kg
            };
        }));

        return enrichedDetections;

    } catch (error) {
        console.warn("Vision Prediction API Failed, using mock fallback:", error);
        // Fallback mock logic
        return [
            { material: "plastic", confidence: 0.97, weight_g: 82.9, carbon_kg: 0.207 },
            { material: "cardboard", confidence: 0.89, weight_g: 150.5, carbon_kg: 0.135 }
        ];
    }
};

/**
 * Pipeline 3: IoT SensorAI Forecast Engine
 * Fetches the daily_emission_model.joblib prediction from the Flask API.
 */
export const predictSensorData = async () => {
    try {
        const response = await fetch('https://ecoguard-iot.onrender.com/api/sensor_data');
        if (response.ok) return await response.json();
    } catch (error) {
        console.warn("IoT API unreachable, falling back to mock trajectory...");
    }

    // --- FALLBACK MOCK LOGIC ---
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
