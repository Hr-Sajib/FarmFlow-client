import { AlertCircle } from "lucide-react";
import React from "react";

const AlertSection = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Alert Notifications
      </h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <ul className="space-y-4">
          <li className="flex items-start gap-3 border-l-4 border-red-500 pl-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                High Temperature Alert
              </p>
              <p className="text-xs text-gray-600">
                2025-06-26 03:45: Temperature exceeded 30°C in North Rice Field.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 border-l-4 border-yellow-500 pl-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Low Soil Moisture Warning
              </p>
              <p className="text-xs text-gray-600">
                2025-06-26 03:30: Soil moisture dropped below 40% in South Wheat
                Field.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default AlertSection;
