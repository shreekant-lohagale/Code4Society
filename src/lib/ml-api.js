// utils/ml-api.js

/**
 * Mocks the Stacking Ensemble R2=0.9885 model.
 * In production, replace this with an actual fetch call to a FastAPI/Flask server hosting the .joblib file.
 * 
 * Example payload to FastAPI:
 * {
 *   "Body Type": "normal",
 *   "Sex": "female",
 *   ...
 * }
 */
export const predictCarbonEmission = async (formData) => {
    console.log("Sending payload to ML model:", formData);

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
    return Math.max(0, Math.round(emission));
};
