'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import FieldCard from '@/components/farmerDashboard/FieldCard';
import TrendsSection from '@/components/farmerDashboard/TrendsSection';
import AlertSection from '@/components/farmerDashboard/AlertSection';
import { TField } from '@/types/types';
import { initializeMqttClient, getMqttClient } from '@/mqtt/mqtt.config';
import Image from 'next/image';
import { useGetMyFieldsQuery } from '@/redux/features/fields/fieldsApi';


export default function FarmerDashboard() {
  const [sensorDataMap, setSensorDataMap] = useState<{
    [fieldId: string]: TField['sensorData'];
  }>({});
  const { token } = useSelector((state: RootState) => state.auth);
  const { data: fields = [], isLoading, error } = useGetMyFieldsQuery(undefined, {
    skip: !token, // Skip query if no token
  });

  useEffect(() => {
    initializeMqttClient();

    const client = getMqttClient();
    if (client) {
      client.on('message', (topic, message) => {
        try {
          const messageString = message.toString();
          const cleaned = messageString.replace(/'/g, '"');
          const data = JSON.parse(cleaned);

          if (data.fieldId) {
            setSensorDataMap((prev) => ({
              ...prev,
              [data.fieldId]: {
                temperature: data.temperature || 0,
                humidity: data.humidity || 0,
                soilMoisture: data.soil_moisture || 0,
                lightIntensity: data.light_intensity || 0,
              },
            }));
          }
        } catch (err) {
          console.error(`Error processing MQTT message from ${topic}:`, err);
        }
      });
    }
  }, []);

  return (
    <div className="px-20 pt-16 w-full py-5 bg-gray-100 min-h-screen">
      <section className="mb-8">
          <div className='flex h-16'>
            <div className="bg-white flex items-center gap-1 bg-gradient-to-r to-green-100 from-white text-2xl w-60 justify-center rounded-md shadow-md font-semibold text-green-800 mb-6">
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
            {error ? 'Failed to fetch fields' : 'No access token found. Please log in.'}
          </p>
        ) : fields.length === 0 ? (
          <p className="text-gray-600 text-center text-lg font-medium">No fields found.</p>
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
      <AlertSection />
      <TrendsSection />
    </div>
  );
}

