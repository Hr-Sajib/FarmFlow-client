'use client';

import { MapPin, Clock, Thermometer, Droplet, Sprout, Sun, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { TField } from '@/types/types';

type FieldCardProps = {
  key: string;
  field: TField;
};

export default function FieldCard({ field }: FieldCardProps) {
  const isActive = field.fieldStatus === 'active';

  return (
    <div className="relative bg-gray-100 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
      {/* Gradient Border (Pseudo-element) */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(to bottom, #f97316, #22c55e)', // Orange to green gradient, top to bottom
          padding: '3px', // Border width
        }}
      >
        <div className="bg-gray-100 rounded-[10px] h-full w-full"></div>
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
            {new Date(field.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1 mb-4">
          <p className="text-sm text-gray-200 w-20 flex justify-center rounded-2xl bg-gray-800">
            <span className="font-medium">{field.fieldSizeInAcres} acres</span>
          </p>
          <p className="text-sm text-gray-200 w-20 flex justify-center rounded-2xl bg-gray-800">
            <span className="font-medium capitalize">{field.soilType} Soil</span>
          </p>
          <p className="text-sm border-1 text-gray-400 w-20 flex justify-center rounded-2xl bg-white">
            <span
              className={`font-medium ${
                field.fieldStatus === 'active' ? 'text-green-700' : 'text-red-500'
              } capitalize`}
            >
              {field.fieldStatus}
            </span>
          </p>
        </div>
        {/* Sensor Values */}
        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-red-500">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-500" />
              <span className="text-sm font-bold text-red-500">
                {(field.sensorData?.temperature || 0).toFixed(2)}°C
              </span>
            </div>
          </div>
          <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-blue-500">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-500">
                {(field.sensorData?.humidity || 0).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-green-500">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-700" />
              <span className="text-sm font-bold text-green-700">
                {(field.sensorData?.soilMoisture || 0).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-50 shadow-sm rounded-md p-3 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-700" />
              <span className="text-sm font-bold text-yellow-600">
                {(field.sensorData?.lightIntensity || 0).toFixed(2)} lux
              </span>
            </div>
          </div>
        </div>
        {/* View Details Button */}
        <a
          href={isActive ? `/fields/${field.fieldId}` : undefined}
          className={`inline-flex items-center gap-2 bg-green-800 text-white py-2 px-4 rounded-md transition-colors duration-300 w-full justify-center text-sm font-bold ${
            isActive ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-disabled={!isActive}
        >
          View Details <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}