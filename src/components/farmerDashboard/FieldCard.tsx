"use client";
 
import { useState } from "react";
import {
  MapPin,
  Clock,
  Thermometer,
  Droplet,
  Sprout,
  Sun,
  ArrowRight,
  Brain,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { TField } from "@/types/types";
import { updateFieldInsights } from "@/redux/features/fields/fieldsSlice";

type FieldCardProps = {
  key: string;
  field: TField;
};

const formatInsights = (text: string) => {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
};

export default function FieldCard({ field }: FieldCardProps) {
  const dispatch = useDispatch();
  const reduxField = useSelector((state: RootState) => 
    state.fields.fields.find(f => f.fieldId === field.fieldId)
  );
  const isActive = field.fieldStatus === "active";
  const [insights, setInsights] = useState(
    reduxField?.insights || 
    `Based on current data, the field exhibits a temperature of ${(
      reduxField?.sensorData?.temperature || field.sensorData?.temperature || 0
    ).toFixed(2)}°C, ` +
    `humidity at ${(reduxField?.sensorData?.humidity || field.sensorData?.humidity || 0).toFixed(2)}%, ` +
    `soil moisture at ${(reduxField?.sensorData?.soilMoisture || field.sensorData?.soilMoisture || 0).toFixed(2)}%, ` +
    `and light intensity of ${(reduxField?.sensorData?.lightIntensity || field.sensorData?.lightIntensity || 0).toFixed(2)} lux. ` +
    `The conditions suggest a stable environment for crop growth.`
  );
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const userPhone = useSelector(
    (state: RootState) => state.auth.user?.userPhone
  );

  const handleLoadInsights = async () => {
    if (!userPhone) {
      console.error("FieldCard: No userPhone available");
      toast.error("User not authenticated");
      return;
    }

    setIsLoadingInsights(true);
    console.log("FieldCard: Loading AI insights for field:", field.fieldId);

    try {
      const fieldInfo = {
        fieldCrop: field.fieldCrop || "Unknown",
        soilType: field.soilType || "Unknown",
        fieldSizeInAcres: field.fieldSizeInAcres
          ? field.fieldSizeInAcres.toString()
          : "Unknown",
        sensorData: {
          temperature: (reduxField?.sensorData?.temperature || field.sensorData?.temperature || 0).toFixed(2),
          humidity: (reduxField?.sensorData?.humidity || field.sensorData?.humidity || 0).toFixed(2),
          soilMoisture: (reduxField?.sensorData?.soilMoisture || field.sensorData?.soilMoisture || 0).toFixed(2),
          lightIntensity: (reduxField?.sensorData?.lightIntensity || field.sensorData?.lightIntensity || 0).toFixed(2),
        },
        latitude: field.fieldLocation.latitude,
        longitude: field.fieldLocation.longitude,
        userPhone,
        role: "farmer",
      };

      const response = await axios.post(
        `http://localhost:5100/field/fields/${field.fieldId}/insights`,
        { data: fieldInfo }
      );
      const newInsights = response.data.data.insights;
      console.log("FieldCard: AI insights loaded:", newInsights);
      setInsights(newInsights);
      dispatch(updateFieldInsights({ fieldId: field.fieldId, insights: newInsights }));
      toast.success(response.data.message || "Insights loaded successfully");
    } catch (err) {
      console.error("FieldCard: Error loading AI insights:", err);
      const axiosError = err as AxiosError<{ message: string }>;
      setInsights("Failed to load insights. Please try again.");
      toast.error(
        axiosError.response?.data?.message || "Failed to load insights"
      );
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
      {/* Gradient Border */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: "linear-gradient(to bottom, #f97316, #22c55e)",
          padding: "3px",
        }}
      >
        <div className="bg-white rounded-[10px] h-full w-full"></div>
      </div>
      {/* Field Image */}
      <div className="relative">
        <Image
          src={field.fieldImage}
          alt={field.fieldName}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
          {field.fieldName}
        </h3>
      </div>
      {/* Field Details */}
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{field.region}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            {field.updatedAt
              ? new Date(field.updatedAt).toLocaleString().slice(0, 10)
              : "N/A"}
          </p>
        </div>
        <div className="flex gap-1 mb-4">
          <p className="text-sm text-gray-200 w-20 flex justify-center rounded-2xl bg-gray-800">
            <span className="font-medium">{field.fieldSizeInAcres} acres</span>
          </p>
          <p className="text-sm text-gray-200 w-20 flex justify-center rounded-2xl bg-gray-800">
            <span className="font-medium capitalize">
              {field.soilType} Soil
            </span>
          </p>
          <p className="text-sm border-1 text-gray-400 w-20 flex justify-center rounded-2xl bg-white">
            <span
              className={`font-medium ${
                field.fieldStatus === "active"
                  ? "text-green-700"
                  : "text-red-500"
              } capitalize`}
            >
              {field.fieldStatus}
            </span>
          </p>
        </div>
        {/* Sensor and Insights Section */}
        <div className="space-y-3 mb-3">
          {/* Temperature and Humidity Row */}
          <div className="flex gap-3">
            <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-red-500 flex-1">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <span className="text-sm font-bold text-red-500">
                  {(reduxField?.sensorData?.temperature || field.sensorData?.temperature || 0).toFixed(2)}°C
                </span>
              </div>
            </div>
            <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-blue-500 flex-1">
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-500">
                  {(reduxField?.sensorData?.humidity || field.sensorData?.humidity || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          {/* Soil Moisture and Light Intensity Row */}
          <div className="flex gap-3">
            <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-green-600 flex-1">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-700" />
                <span className="text-sm font-bold text-green-700">
                  {(reduxField?.sensorData?.soilMoisture || field.sensorData?.soilMoisture || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-yellow-500 flex-1">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-700" />
                <span className="text-sm font-bold text-yellow-600">
                  {(reduxField?.sensorData?.lightIntensity || field.sensorData?.lightIntensity || 0).toFixed(2)} lux
                </span>
              </div>
            </div>
          </div>
          {/* AI Insights Section */}
          <div className="bg-gray-50 shadow-sm border-gray-100 rounded-md h-38">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" /> AI Insights
                </h4>
                <button
                  onClick={handleLoadInsights}
                  disabled={!isActive || isLoadingInsights}
                  className="text-blue-600 mb-2 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoadingInsights ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCcw className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p
                className="text-sm text-gray-600 whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: isLoadingInsights ? "Loading insights..." : formatInsights(insights),
                }}
              />
            </div>
          </div>
        </div>
        {/* View Details Button */}
        <a
          href={isActive ? `/fields/${field.fieldId}` : undefined}
          className={`inline-flex items-center gap-2 bg-green-800 text-white py-2 px-4 rounded-md transition-colors duration-300 w-full justify-center text-sm font-bold ${
            isActive ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed"
          }`}
          aria-disabled={!isActive}
        >
          View Details <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}