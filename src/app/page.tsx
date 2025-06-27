'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/redux/store';
import FieldCard from '@/components/farmerDashboard/FieldCard';
import TrendsSection from '@/components/farmerDashboard/TrendsSection';
import AlertSection from '@/components/farmerDashboard/AlertSection';
import { TField } from '@/types/types';
import { initializeMqttClient, getMqttClient } from '@/mqtt/mqtt.config';

export default function FarmerDashboard() {
  const [fields, setFields] = useState<TField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensorDataMap, setSensorDataMap] = useState<{
    [fieldId: string]: TField['sensorData'];
  }>({});
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get('http://localhost:5100/field/myFields', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFields(response.data.data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch fields');
        setLoading(false);
      }
    };

    if (token) {
      fetchFields();
    } else {
      setError('No access token found. Please log in.');
      setLoading(false);
    }
  }, [token]);

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
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <section className="mb-8">
        <h2 className="text-2xl w-60 flex justify-center rounded-md shadow-md bg-white font-semibold text-green-800 mb-6">
          Farmer Dashboard
        </h2>
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading fields...</span>
          </div>
        ) : error ? (
          <p className="text-red-600 text-center text-lg font-medium">{error}</p>
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