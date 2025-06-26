import React from "react";

const TrendsSection = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Trend Charts
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Temperature Over Time
          </h3>
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              [Recharts Temperature Line Chart Placeholder]
            </p>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Soil Moisture Over Time
          </h3>
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              [Recharts Soil Moisture Line Chart Placeholder]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendsSection;
