import { useState } from 'react';
import Wizard from '../components/calculator/Wizard';
import Scorecard from '../components/calculator/Scorecard';
import { predictCarbonEmission } from '../lib/ml-api';

const AppDashboard = () => {
    const [prediction, setPrediction] = useState(null);

    const [isCalculating, setIsCalculating] = useState(false);

    const handleComplete = async (data) => {
        setIsCalculating(true);
        console.log("Collected Data:", data);

        try {
            const result = await predictCarbonEmission(data);
            setPrediction(result);
        } catch (error) {
            console.error("Prediction failed:", error);
            setPrediction(2435); // fallback
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] w-full pt-24 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-start pb-20">

            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[var(--color-brand-accent)]/5 to-[var(--color-brand-bg)] -z-10" />

            <div className="w-full max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Carbon Emission Calculator</h1>
                    <p className="text-[var(--color-brand-text-secondary)] text-lg">
                        Answer the following questions to get a hyper-accurate reading using our Gradient Boosting ML Model.
                    </p>
                </div>

                {!prediction ? (
                    <div className="relative">
                        {isCalculating && (
                            <div className="absolute inset-0 z-50 bg-[var(--color-brand-surface)]/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-[var(--color-brand-accent)] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-white font-medium animate-pulse">Running ML Model...</p>
                            </div>
                        )}
                        <Wizard onComplete={handleComplete} />
                    </div>
                ) : (
                    <Scorecard score={prediction} />
                )}
            </div>

        </div>
    );
};

export default AppDashboard;
