/**
 * Pipeline 1: Regression Model (Lifestyle Data)
 * Mocks the Stacking Ensemble R2=0.9885 model.
 * Expected Endpoint: POST /predict_lifestyle
 */
export const predictLifestyle = async (formData) => {
    console.log("Pipeline 1 -> Sending payload to Lifestyle ML:", formData);

    // Simulate network delay to Python Backend
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple heuristic-based mock prediction just for demo purposes if backend isn't up
    // Base emission
    let emission = 1500;

    // Transport (highest impact)
    if (formData["Transport"] === "private") {
        if (formData["Vehicle Type"] === "petrol") emission += (formData["Vehicle Monthly Distance Km"] * 0.25);
        if (formData["Vehicle Type"] === "diesel") emission += (formData["Vehicle Monthly Distance Km"] * 0.28);
        if (formData["Vehicle Type"] === "electric") emission += (formData["Vehicle Monthly Distance Km"] * 0.08); // indirect grid emissions
    } else if (formData["Transport"] === "public") {
        emission += (formData["Vehicle Monthly Distance Km"] * 0.05); // Bus/train average
    }

    // Air Travel (vast impact)
    const airTravelMap = {
        "never": 0,
        "rarely": 400,
        "frequently": 1500,
        "very frequently": 3500
    };
    emission += airTravelMap[formData["Frequency of Traveling by Air"]] || 0;

    // Heating
    const heatMap = {
        "coal": 800,
        "natural gas": 400,
        "electricity": 200, // assumes mixed grid
        "wood": 300
    };
    emission += heatMap[formData["Heating Energy Source"]] || 0;

    // Diet
    const dietMap = {
        "vegan": -300,
        "vegetarian": -150,
        "pescatarian": 0,
        "omnivore": 300
    };
    emission += dietMap[formData["Diet"]] || 0;

    // Consumption (Groceries & Clothes)
    emission += (formData["Monthly Grocery Bill"] * 1.5);
    emission += (formData["How Many New Clothes Monthly"] * 25);

    // Waste
    const wasteSizeMap = { "small": 1, "medium": 1.5, "large": 2, "extra large": 2.5 };
    const wasteFactor = wasteSizeMap[formData["Waste Bag Size"]] || 1.5;
    emission += (formData["Waste Bag Weekly Count"] * wasteFactor * 52); // Weekly to yearly approx

    // Minor reductions for recycling
    if (formData["Recycling"]) {
        emission -= (formData["Recycling"].length * 50);
    }

    // Minor reductions for energy efficiency
    if (formData["Energy efficiency"] === "Yes") {
        emission -= 200;
    }

    // Floor the emission at 0 for safety
    return {
        lifestyle_carbon: Math.max(0, Math.round(emission))
    };
};

/**
 * Pipeline 2: Computer Vision Model (Waste Items)
 * Mocks the YOLO image detection and weight prediction.
 * Expected Endpoint: POST /predict (FormData with image file)
 */
export const predictImage = async (imageFile) => {
    console.log("Pipeline 2 -> Sending file to YOLO ML:", imageFile?.name);

    // Simulate network delay to Python Vision Backend
    await new Promise(resolve => setTimeout(resolve, 3000));

    // If no file was provided, return empty
    if (!imageFile) return [];

    // Mock response simulating `predictor.py` logic
    return [
        {
            material: "plastic",
            confidence: 0.97,
            weight_g: 82.9,
            carbon_kg: 0.207
        },
        {
            material: "cardboard",
            confidence: 0.89,
            weight_g: 150.5,
            carbon_kg: 0.135
        }
    ];
};
