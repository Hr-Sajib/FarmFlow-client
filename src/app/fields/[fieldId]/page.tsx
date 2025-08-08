'use client';

import { notFound } from 'next/navigation';
import { MapPin, Clock, Thermometer, Droplet, Sprout, Sun, Brain, Leaf, Pen } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { initializeMqttClient, getMqttClient } from '@/mqtt/mqtt.config';
import { useGetFieldByIdQuery } from '@/redux/features/fields/fieldsApi';
import UpdateFieldModal from '@/components/fieldsUpdate/UpdateFieldModal';
import { use } from 'react';

type Props = {
  params: Promise<{ fieldId: string }>; // Updated to reflect params as a Promise
};

export interface TField {
  fieldId: string;
  fieldName: string;
  fieldImage: string;
  fieldCrop: string;
  fieldLocation: {
    latitude: number;
    longitude: number;
  };
  fieldSizeInAcres?: number;
  soilType?: 'clay' | 'loam' | 'sandy' | 'silt' | 'peat' | 'chalk' | 'saline';
  farmerId: string;
  region?: string;
  fieldStatus?: 'active' | 'inactive' | 'maintenance';
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  sensorData?: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
  };
}

export default function FieldDetailsPage({ params }: Props) {
  const { fieldId } = use(params); // Unwrap params with React.use()
  const { data, error, isLoading } = useGetFieldByIdQuery(fieldId);
  const [sensorData, setSensorData] = useState<TField['sensorData']>({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });
  const [motorStatus, setMotorStatus] = useState<'on' | 'off'>('off');
  const [shadeStatus, setShadeStatus] = useState<'on' | 'off'>('off');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initializeMqttClient();

    const client = getMqttClient();
    if (client) {
      client.on('message', (topic, message) => {
        try {
          const messageString = message.toString();
          const cleaned = messageString.replace(/'/g, '"');
          const data = JSON.parse(cleaned);

          if (data.fieldId === fieldId) {
            setSensorData({
              temperature: data.temperature || 0,
              humidity: data.humidity || 0,
              soilMoisture: data.soil_moisture || 0,
              lightIntensity: data.light_intensity || 0,
            });
          }
        } catch (err) {
          console.error(`Error processing MQTT message from ${topic}:`, err);
        }
      });

      return () => {
        client.removeAllListeners('message');
      };
    }
  }, [fieldId]);

  const handleActuatorControl = (actuator: 'motor' | 'shade', status: 'on' | 'off') => {
    const client = getMqttClient();
    if (client) {
      const topic = `field/${fieldId}/actuator`;
      const message = JSON.stringify({
        fieldId,
        actuator,
        status,
      });
      client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error publishing ${actuator} ${status} command:`, err);
        } else {
          if (actuator === 'motor') {
            setMotorStatus(status);
          } else {
            setShadeStatus(status);
          }
        }
      });
    }
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

  const isActive = data.fieldStatus === 'active';

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          <div className="bg-white rounded-[10px]">
            <div className="relative">
              <Image
                src={data.fieldImage}
                alt={data.fieldName}
                width={896}
                height={300}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl font-bold text-white">{data.fieldName}</h1>
                <p className="text-sm text-gray-200 flex items-center gap-2 mt-2">
                  <MapPin className="h-5 w-5 text-gray-300" />
                  <span>{data.region}</span>
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
                      {data.updatedAt ? new Date(data.updatedAt).toLocaleString().slice(0, 10) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Crop Type</p>
                    <p className="font-medium text-gray-800 capitalize">{data.fieldCrop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <span className="text-sm text-gray-200 bg-gray-800 rounded-full px-4 py-1">
                    {data.fieldSizeInAcres} acres
                  </span>
                  <span className="text-sm text-gray-200 bg-gray-800 rounded-full px-4 py-1 capitalize">
                    {data.soilType} Soil
                  </span>
                  <span
                    className={`text-sm border-1 px-4 py-1 rounded-full capitalize ${
                      isActive ? 'text-green-700 bg-green-100' : 'text-red-500 bg-red-100'
                    }`}
                  >
                    {data.fieldStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md shadow-sm">
                  <MapPin className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">
                      Lat: {data.fieldLocation.latitude.toFixed(4)}, Long: {data.fieldLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Sensor Data</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 shadow-sm rounded-md p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="text-sm font-bold text-red-500">
                          {(sensorData?.temperature || 0).toFixed(2)}°C
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Humidity</p>
                        <p className="text-sm font-bold text-blue-500">
                          {(sensorData?.humidity || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-4 border-l-4 border-green-600">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-green-700" />
                      <div>
                        <p className="text-sm text-gray-600">Soil Moisture</p>
                        <p className="text-sm font-bold text-green-700">
                          {(sensorData?.soilMoisture || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 shadow-sm rounded-md p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-700" />
                      <div>
                        <p className="text-sm text-gray-600">Light Intensity</p>
                        <p className="text-sm font-bold text-yellow-600">
                          {(sensorData?.lightIntensity || 0).toFixed(2)} lux
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 shadow-sm rounded-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" /> AI Insights
                </h2>
                <p className="text-gray-600">
                  Based on current data, the field exhibits a temperature of{' '}
                  {(sensorData?.temperature || 0).toFixed(2)}°C, humidity at{' '}
                  {(sensorData?.humidity || 0).toFixed(2)}%, soil moisture at{' '}
                  {(sensorData?.soilMoisture || 0).toFixed(2)}%, and light intensity of{' '}
                  {(sensorData?.lightIntensity || 0).toFixed(2)} lux. The conditions suggest a stable environment for crop growth.
                </p>
              </div>

              <div className="bg-gray-50 shadow-sm rounded-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actuator Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-gray-600">Motor Control</h3>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-600">
                        {motorStatus === 'on' ? 'Motor On' : 'Motor Off'}
                      </label>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 ${
                          motorStatus === 'on' ? 'bg-green-800' : 'bg-gray-300'
                        }`}
                        onClick={() => handleActuatorControl('motor', motorStatus === 'on' ? 'off' : 'on')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            motorStatus === 'on' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-gray-600">Shade Control</h3>
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-600">
                        {shadeStatus === 'on' ? 'Shade On' : 'Shade Off'}
                      </label>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 ${
                          shadeStatus === 'on' ? 'bg-green-800' : 'bg-gray-300'
                        }`}
                        onClick={() => handleActuatorControl('shade', shadeStatus === 'on' ? 'off' : 'on')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            shadeStatus === 'on' ? 'translate-x-6' : 'translate-x-1'
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
        {isModalOpen && <UpdateFieldModal field={data} onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
}