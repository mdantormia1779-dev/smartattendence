import React from 'react';

const stepsData = [
    {
        number: "01",
        title: "Face Verification",
        description: "Employees scan their face with anti-spoofing liveness detection."
    },
    {
        number: "02",
        title: "GPS Verification",
        description: "Location confirmed within the branch geo-fence radius."
    },
    {
        number: "03",
        title: "Optional Biometric",
        description: "Fingerprint confirmation for high-security branches."
    },
    {
        number: "04",
        title: "Check-in Recorded",
        description: "Attendance logged instantly with a real-time record."
    }
];

const HowItWorks = () => {
    return (
        <section className="w-full bg-[#FBF9F5] py-20 px-6 md:px-12">
            
            {/* Section Header */}
            <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00B050]">
                    How it works
                </span>
                
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                    A secure check-in, in seconds
                </h2>
            </div>

            {/* Steps Cards Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stepsData.map((step, index) => (
                    <div 
                        key={index} 
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            {/* Step Number */}
                            <div className="text-3xl md:text-4xl font-bold text-[#00B050]">
                                {step.number}
                            </div>

                            {/* Step Title */}
                            <h3 className="text-xl font-bold text-gray-900">
                                {step.title}
                            </h3>

                            {/* Step Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default HowItWorks;