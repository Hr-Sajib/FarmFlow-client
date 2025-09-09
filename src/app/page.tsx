/* eslint-disable */


"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { TField } from "@/types/types";
import { initializeMqttClient, getMqttClient } from "@/mqtt/mqtt.config";
import Image from "next/image";
import { useGetMyFieldsQuery } from "@/redux/features/fields/fieldsApi";
import { useAppSelector } from "@/redux/hooks";
import FieldCard from "@/components/farmerDashboard/FieldCard";
// import AlertSection from "@/components/farmerDashboard/AlertSection";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { updateFieldSensorData } from "@/redux/features/fields/fieldsSlice";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function MainDashboard() {
  const dispatch = useDispatch();
  const [sensorDataMap, setSensorDataMap] = useState<{
    [fieldId: string]: TField["sensorData"];
  }>({});
  const [isMqttReady, setIsMqttReady] = useState(false);
  const [mqttError, setMqttError] = useState<string | null>(null);
  const { token } = useSelector((state: RootState) => state.auth);
  const {
    data: fields = [],
    isLoading,
    error,
  } = useGetMyFieldsQuery(undefined, {
    skip: !token,
  });

  const { currentUser } = useAppSelector((state: RootState) => state.currentUser);

  useEffect(() => {
    if (!currentUser?.farmerId || currentUser.role === "admin") {
      setIsMqttReady(false);
      setMqttError(null);
      return;
    }

    const topicName = `topic_farmer${currentUser.farmerId.slice(-1)}`;
    console.log("MainDashboard: Initializing MQTT with topic:", topicName);

    // Retry MQTT connection up to 3 times
    let retryCount = 0;
    const maxRetries = 3;
    const retryInterval = 3000; // 3 seconds
    const connectTimeout = 10000; // 10 seconds timeout

    const connectMqtt = () => {
      initializeMqttClient(topicName);
      const client = getMqttClient();

      if (client) {
        client.on("connect", () => {
          console.log("MainDashboard: MQTT client connected to topic:", topicName);
          setIsMqttReady(true);
          setMqttError(null);
        });

        client.on("error", (err) => {
          console.error("MainDashboard: MQTT connection error:", err);
          setMqttError("Failed to connect to sensor data feed");
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`MainDashboard: Retrying MQTT connection (${retryCount}/${maxRetries})`);
            setTimeout(connectMqtt, retryInterval);
          } else {
            toast.error("Failed to connect to sensor data feed after retries");
            setIsMqttReady(false);
          }
        });

        client.on("message", (topic, message) => {
          try {
            const messageString = message.toString();
            const cleaned = messageString.replace(/'/g, '"');
            const data = JSON.parse(cleaned);
            console.log(`MainDashboard: MQTT message received`, { topic, data });

            if (data.fieldId) {
              const sensorData = {
                temperature: data.temperature || 0,
                humidity: data.humidity || 0,
                soilMoisture: data.soil_moisture || 0,
                lightIntensity: data.light_intensity || 0,
              };
              setSensorDataMap((prev) => ({
                ...prev,
                [data.fieldId]: sensorData,
              }));
              dispatch(
                updateFieldSensorData({
                  fieldId: data.fieldId,
                  sensorData,
                })
              );
              // Force isMqttReady to true since messages are being received
              if (!isMqttReady) {
                console.log("MainDashboard: Setting isMqttReady to true due to received message");
                setIsMqttReady(true);
                setMqttError(null);
              }
            }
          } catch (err) {
            console.error(`MainDashboard: Error processing MQTT message from ${topic}:`, err);
          }
        });

        // Fallback timeout for MQTT connection
        const timeoutId = setTimeout(() => {
          if (!isMqttReady && !mqttError) {
            console.log("MainDashboard: MQTT connection timeout, forcing isMqttReady to true");
            setIsMqttReady(true);
            setMqttError(null);
          }
        }, connectTimeout);

        return () => {
          clearTimeout(timeoutId);
          if (client) {
            client.removeAllListeners("message");
            client.removeAllListeners("connect");
            client.removeAllListeners("error");
            client.end();
            console.log("MainDashboard: MQTT client disconnected");
            setIsMqttReady(false);
            setMqttError(null);
          }
        };
      }
    };

    connectMqtt();
  }, [currentUser, dispatch, isMqttReady]);

  if (!currentUser) {
    return (
      <div className="px-20 pt-16 w-full py-5 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading user data...</p>
      </div>
    );
  }

  if (currentUser.role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="px-20 pt-16 w-full py-5 bg-gray-100 min-h-screen">
      <section className="mb-8">
        <div className="flex h-16">
          <div className="bg-white flex items-center gap-1 bg-gradient-to-r to-green-100 from-white text-2xl w-62 justify-center rounded-md shadow-md font-semibold text-green-800 mb-6">
            <Image
              width={100}
              height={100}
              className="h-7 w-7"
              alt="logo"
              src="https://i.postimg.cc/pLYBKqTW/farmer-Icon.png"
            />
            <h2>Farmer Dashboard</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-300 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600 text-center text-lg font-medium">
            {error
              ? "Failed to fetch fields"
              : "No access token found. Please log in."}
          </p>
        ) : fields.length === 0 ? (
          <p className="text-gray-600 text-center text-lg font-medium">
            No fields found.
          </p>
        ) : !isMqttReady && !mqttError ? (
          <div className="text-gray-600 text-center text-lg font-medium flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            Connecting to sensor data feed...
          </div>
        ) : mqttError ? (
          <p className="text-red-600 text-center text-lg font-medium">
            {mqttError}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <FieldCard
                key={field.fieldId}
                field={{
                  _id: field._id,
                  fieldId: field.fieldId,
                  fieldName: field.fieldName,
                  fieldImage: field.fieldImage,
                  fieldCrop: field.fieldCrop,
                  fieldLocation: field.fieldLocation,
                  fieldSizeInAcres: field.fieldSizeInAcres,
                  soilType: field.soilType,
                  farmerId: field.farmerId,
                  region: field.region,
                  fieldStatus: field.fieldStatus,
                  createdAt: field.createdAt,
                  updatedAt: field.updatedAt,
                  isDeleted: field.isDeleted,
                  sensorData: sensorDataMap[field.fieldId] || {
                    temperature: 0,
                    humidity: 0,
                    soilMoisture: 0,
                    lightIntensity: 0,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>
      {/* <AlertSection /> */}
    </div>
  );
}