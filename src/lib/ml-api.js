/**
 * EcoGuard ML API Integration
 * Connects the frontend to the FastAPI AI Engine on Render.
 * Aligned with the Frontend Integration Guide 🎨
 */

const API_BASE_URL = 'https://ecoguard-mlops.onrender.com';

/**
 * Pipeline 1: Regression Model (Lifestyle Data)
 * Expected Endpoint: POST /api/lifestyle/predict
 * Body: { "features": [0.0 - 1.0, ...] } (20 normalized floats)
 */
export const predictLifestyle = async (formData) => {
    console.log("Pipeline 1 -> Sending normalized payload to Lifestyle ML:", formData);

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

        // Construct 20 normalized features list (matching model expectation in Guide)
        const features = [
            mappings.bodyType[formData["Body Type"]?.toLowerCase()] || 0.33, // 0
            mappings.sex[formData["Sex"]?.toLowerCase()] || 0, // 1
            mappings.diet[formData["Diet"]?.toLowerCase()] || 1, // 2
            mappings.shower[formData["How Often Shower"]?.toLowerCase()] || 0.33, // 3
            mappings.heating[formData["Heating Energy Source"]?.toLowerCase()] || 0, // 4
            mappings.transport[formData["Transport"]?.toLowerCase()] || 0.5, // 5
            mappings.vehicle[formData["Vehicle Type"]?.toLowerCase()] || 0, // 6
            mappings.social["sometimes"], // 7: Social Activity (Default "sometimes")
            Math.min(1.0, (parseFloat(formData["Monthly Grocery Bill"]) || 0) / 1000), // 8: Normalized bill (up to 1000)
            mappings.airTravel[formData["Frequency of Traveling by Air"]?.toLowerCase()] || 0, // 9
            Math.min(1.0, (parseFloat(formData["Vehicle Monthly Distance Km"]) || 0) / 1000), // 10: Normalized distance (up to 1000)
            mappings.wasteSize[formData["Waste Bag Size"]?.toLowerCase()] || 0.33, // 11
            Math.min(1.0, (parseFloat(formData["Waste Bag Weekly Count"]) || 0) / 10), // 12: Normalized count (up to 10)
            Math.min(1.0, (parseFloat(formData["How Long TV PC Daily Hour"]) || 0) / 24), // 13: Time (up to 24h)
            Math.min(1.0, (parseFloat(formData["How Many New Clothes Monthly"]) || 0) / 10), // 14: Count (up to 10)
            Math.min(1.0, (parseFloat(formData["How Long Internet Daily Hour"]) || 0) / 24), // 15: Time (up to 24h)
            mappings.efficiency[formData["Energy efficiency"]] || 0.5, // 16
            Math.min(1.0, (formData["Recycling"]?.length || 0) / 5), // 17: Recycling (up to 5 items)
            Math.min(1.0, (formData["Cooking_With"]?.length || 0) / 5), // 18: Cooking (up to 5 items)
            0 // 19: Placeholder
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
            yearly_carbon: data.yearly_carbon_kg,
            recommendation: data.recommendation,
            compared_to_average: data.compared_to_average_percent
        };

    } catch (error) {
        console.warn("Lifestyle Prediction API Failed, using local heuristic fallback:", error);
        
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
            error: true
        };
    }
};

/**
 * Pipeline 2: Computer Vision Model (Waste Items)
 * Endpoint: POST /api/vision/analyze
 * Body: multipart/form-data { "file": binary }
 */
export const predictImage = async (imageFile) => {
    if (!imageFile) return [];
    console.log("Pipeline 2 -> Sending file to Unified EcoGuard Vision Analyze API:", imageFile.name);

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        // Call the new unified endpoint (returns detections, weights, and carbon in one call)
        const response = await fetch(`${API_BASE_URL}/api/vision/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Vision Analyze API Error: ${response.status}`);
        const data = await response.json();
        
        // The API now returns a unified structure with all metrics included
        const detections = data.detections || [];
        
        // Map detections to ensure they match UI expecting weight_g and carbon_kg
        return detections.map(det => ({
            material: det.class_name,
            confidence: det.confidence,
            bbox: det.bbox,
            weight_g: det.weight_g,
            carbon_g: det.carbon_g,
            carbon_kg: det.carbon_g / 1000, // Keep kg for legacy UI components
            size_category: det.size_category
        }));

    } catch (error) {
        console.warn("Vision Analyze API Failed, using mock fallback:", error);
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
        const response = await fetch('https://ecoguard-iot.onrender.com/api/sensor_data');
        if (response.ok) return await response.json();
    } catch (error) {
        console.warn("IoT API unreachable, falling back to mock trajectory...");
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
