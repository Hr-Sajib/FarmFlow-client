import { AlertCircle } from "lucide-react";

export default function AI_Insights() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Insights</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <ul className="space-y-4">
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <p className="text-gray-800 font-medium">Irrigation Needed</p>
              <p className="text-sm text-gray-600">
                Soil moisture levels are below optimal for rice crops. Consider
                starting irrigation.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
            <div>
              <p className="text-gray-800 font-medium">Shading Advised</p>
              <p className="text-sm text-gray-600">
                High light intensity detected. Deploy shade nets to protect
                crops.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
