/* eslint-disable */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Thermometer,
  Droplet,
  Sprout,
  Sun,
  Brain,
  Leaf,
  Pen,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { initializeMqttClient, publishMqttMessage } from "@/mqtt/mqtt.config";
import {
  useGetFieldByIdQuery,
  useUpdateFieldMutation,
} from "@/redux/features/fields/fieldsApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { TField } from "@/types/types";
import UpdateFieldModalComponent from "@/components/fieldsUpdate/UpdateFieldModal";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { use } from "react";

type Props = {
  params: Promise<{ fieldId: string }>;
};

type MqttMessage = { actuator: "motor" | "shade"; status: "on" | "off" };

const formatInsights = (text: string) => {
  return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
};

export default function FieldDetailsPage({ params }: Props) {
  const { fieldId } = use(params); // Unwrap params Promise using React.use()
  const { data, error, isLoading } = useGetFieldByIdQuery(fieldId);
  const [updateField] = useUpdateFieldMutation();
  const { currentUser } = useAppSelector(
    (state: RootState) => state.currentUser
  );
  const userPhone = useAppSelector(
    (state: RootState) => state.auth.user?.userPhone
  );
  const [sensorDataMap, setSensorDataMap] = useState<{
    [fieldId: string]: TField["sensorData"];
  }>({});
  const [insights, setInsights] = useState(
    `Based on current data, the field exhibits a temperature of 0.00°C, ` +
      `humidity at 0.00%, ` +
      `soil moisture at 0.00%, ` +
      `and light intensity of 0.00 lux. `
  );
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [motorStatus, setMotorStatus] = useState<"on" | "off">("off");
  const [shadeStatus, setShadeStatus] = useState<"on" | "off">("off");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicName, setTopicName] = useState("");

  useEffect(() => {
    if (currentUser?.role === "admin") {
      console.log("field data: ", data);
      const farmerTopic = `topic_farmer${data?.farmerId.slice(-1)}`;
      setTopicName(farmerTopic ?? "");
    } else {
      const farmerTopic = `topic_farmer${currentUser?.farmerId.slice(-1)}`;
      setTopicName(farmerTopic ?? "");
      console.log("tpc name : ", topicName);
    }
  }, [currentUser, data, topicName]);

  useEffect(() => {
    if (!topicName) return;

    const handleMessage = (topic: string, message: Buffer) => {
      try {
        const messageString = message.toString();
        const cleaned = messageString.replace(/'/g, '"');
        const data = JSON.parse(cleaned);
        console.log("FieldDetailsPage: Received MQTT data:", data);

        if (data.fieldId === fieldId) {
          const newSensorData = {
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            soilMoisture: data.soil_moisture || 0,
            lightIntensity: data.light_intensity || 0,
          };
          setSensorDataMap((prev) => ({
            ...prev,
            [data.fieldId]: newSensorData,
          }));
        }
      } catch (err) {
        console.error(
          `FieldDetailsPage: Error processing MQTT message from ${topic}:`,
          err
        );
      }
    };

    initializeMqttClient(topicName, handleMessage);
  }, [topicName, fieldId]);

  useEffect(() => {
    if (data) {
      const field = data as TField;
      // Initialize button states based on fetched field data
      setMotorStatus(field.motorOn ? "on" : "off");
      setShadeStatus(field.shadeOn ? "on" : "off");
    }
  }, [data]);

  const handleLoadInsights = async () => {
    if (!userPhone) {
      console.error("FieldDetailsPage: No userPhone available");
      toast.error("User not authenticated");
      return;
    }

    setIsLoadingInsights(true);
    console.log("FieldDetailsPage: Loading AI insights for field:", fieldId);

    try {
      const fieldInfo = {
        fieldCrop: field?.fieldCrop || "Unknown",
        soilType: field?.soilType || "Unknown",
        fieldSizeInAcres: field?.fieldSizeInAcres
          ? field.fieldSizeInAcres.toString()
          : "Unknown",
        sensorData: {
          temperature: (sensorDataMap[fieldId]?.temperature || 0).toFixed(2),
          humidity: (sensorDataMap[fieldId]?.humidity || 0).toFixed(2),
          soilMoisture: (sensorDataMap[fieldId]?.soilMoisture || 0).toFixed(2),
          lightIntensity: (sensorDataMap[fieldId]?.lightIntensity || 0).toFixed(
            2
          ),
        },
        latitude: field?.fieldLocation.latitude || 0,
        longitude: field?.fieldLocation.longitude || 0,
        userPhone,
        role: "farmer",
      };

      const response = await axios.post(
        // `http://localhost:5100/field/fields/${fieldId}/longInsights`,
        `http://31.97.224.58:5101/field/fields/${fieldId}/longInsights`,
        { data: fieldInfo }
      );
      const newInsights = response.data.data.insights;
      console.log("FieldDetailsPage: AI insights loaded:", newInsights);
      setInsights(newInsights);
      toast.success(response.data.message || "Insights loaded successfully");
    } catch (err) {
      console.error("FieldDetailsPage: Error loading AI insights:", err);
      const axiosError = err as AxiosError<{ message: string }>;
      setInsights("Failed to load insights. Please try again.");
      toast.error(
        axiosError.response?.data?.message || "Failed to load insights"
      );
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleActuatorControl = async (
    actuator: "motor" | "shade",
    status: "on" | "off"
  ) => {
    if (!currentUser?.farmerId) {
      console.error("FieldDetailsPage: No farmerId available for publishing");
      toast.error("User not authenticated");
      return;
    }

    const controlTopic = `commands/${currentUser.farmerId}/${fieldId}`;
    const message: MqttMessage = {
      actuator,
      status,
    };

    // Publish MQTT message
    publishMqttMessage(controlTopic, message, async (err) => {
      if (err) {
        console.error(
          `FieldDetailsPage: Error publishing ${actuator} command to ${controlTopic}:`,
          err
        );
        toast.error(`Failed to update ${actuator} status`);
        return;
      }

      console.log(
        `FieldDetailsPage: Published ${actuator} command to ${controlTopic}`,
        message
      );

      // Update field in database
      try {
        const updateData = {
          [actuator === "motor" ? "motorOn" : "shadeOn"]: status === "on",
        };
        await updateField({ fieldId, data: updateData }).unwrap();
        console.log(
          `FieldDetailsPage: Updated ${actuator} status to ${status} in database`
        );

        // Update local state only on successful MQTT and API update
        if (actuator === "motor") {
          setMotorStatus(status);
        } else {
          setShadeStatus(status);
        }
        toast.success(
          `${
            actuator.charAt(0).toUpperCase() + actuator.slice(1)
          } turned ${status}`
        );
      } catch (apiErr) {
        console.error(
          `FieldDetailsPage: Error updating ${actuator} status in database:`,
          apiErr
        );
        toast.error(`Failed to update ${actuator} status in database`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data || data.isDeleted) {
    return notFound();
  }

  const field = data as TField;
  const isActive = field.fieldStatus === "active";

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          <div className="bg-white rounded-[10px]">
            <div className="relative">
              <Image
                src={field.fieldImage}
                alt={field.fieldName}
                width={896}
                height={300}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl font-bold text-white">
                  {field.fieldName}
                </h1>
                <p className="text-sm text-gray-200 flex items-center gap-2 mt-2">
                  <MapPin className="h-5 w-5 text-gray-300" />
                  <span>{field.region}</span>
                </p>
              </div>
              <button
                className="absolute top-4 right-4 bg-green-800 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-300 border border-gray-400"
                onClick={() => setIsModalOpen(true)}
              >
                <Pen className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <Clock className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-800">
                      {field.updatedAt
                        ? new Date(field.updatedAt)
                            .toLocaleString()
                            .slice(0, 10)
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Crop Type</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {field.fieldCrop}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <span className="text-sm text-gray-200 bg-gray-800 rounded-full px-4 py-1">
                    {field.fieldSizeInAcres} acres
                  </span>
                  <span className="text-sm text-gray-200 bg-gray-800 rounded-full px-4 py-1 capitalize">
                    {field.soilType} Soil
                  </span>
                  <span
                    className={`text-sm border-1 px-4 py-1 rounded-full capitalize ${
                      isActive
                        ? "text-green-700 bg-green-100"
                        : "text-red-500 bg-red-100"
                    }`}
                  >
                    {field.fieldStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <MapPin className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-sm text-gray-800">
                      <span className="border rounded-full pr-1">
                        <span className="bg-blue-900 rounded-l-full text-white px-1">
                          Lat
                        </span>{" "}
                        {field.fieldLocation.latitude.toFixed(4)}
                      </span>
                      <span className="border ml-1 rounded-full pr-1">
                        <span className="bg-blue-900 rounded-l-full text-white px-1">
                          Lon
                        </span>{" "}
                        {field.fieldLocation.longitude.toFixed(4)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Sensor Data
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-red-500 flex-1">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-bold text-red-500">
                        {(sensorDataMap[fieldId]?.temperature || 0).toFixed(2)}
                        °C
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-blue-500 flex-1">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-500">
                        {(sensorDataMap[fieldId]?.humidity || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-green-600 flex-1">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-green-700" />
                      <span className="text-sm font-bold text-green-700">
                        {(sensorDataMap[fieldId]?.soilMoisture || 0).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-yellow-500 flex-1">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-700" />
                      <span className="text-sm font-bold text-yellow-600">
                        {(sensorDataMap[fieldId]?.lightIntensity || 0).toFixed(
                          2
                        )}{" "}
                        lux
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 shadow-sm rounded-md p-6 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="h-6 w-6 text-blue-600" /> AI Insights
                  </h2>
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
                  className="text-sm text-gray-600 whitespace-pre-line font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: isLoadingInsights
                      ? "Loading insights..."
                      : formatInsights(insights),
                  }}
                />
              </div>

              <div className="bg-gray-50 shadow-sm rounded-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  🛠️ Controls
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 border p-3 border-gray-300 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600">
                      Motor Control
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-600">
                        {motorStatus === "on" ? "Motor On" : "Motor Off"}
                      </label>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 ${
                          motorStatus === "on" ? "bg-green-800" : "bg-gray-300"
                        }`}
                        onClick={() =>
                          handleActuatorControl(
                            "motor",
                            motorStatus === "on" ? "off" : "on"
                          )
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            motorStatus === "on"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border p-3 border-gray-300 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600">
                      Shade Control
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-600">
                        {shadeStatus === "on" ? "Shade On" : "Shade Off"}
                      </label>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 ${
                          shadeStatus === "on" ? "bg-green-800" : "bg-gray-300"
                        }`}
                        onClick={() =>
                          handleActuatorControl(
                            "shade",
                            shadeStatus === "on" ? "off" : "on"
                          )
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            shadeStatus === "on"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <UpdateFieldModalComponent
            field={field}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
