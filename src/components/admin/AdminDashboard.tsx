'use client';

import Image from 'next/image';
import { MapPin, Clock, Leaf } from 'lucide-react';
import { TField } from '@/types/types';
import { useState } from 'react';
import CreateFieldModal from './CreateField';

type AdminDashboardProps = {
  fields: TField[];
  isLoading: boolean;
  error: any;
};

export default function AdminDashboard({ fields, isLoading, error }: AdminDashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="px-4 sm:px-6 lg:px-20 pt-16 w-full py-5 bg-gray-100 min-h-screen">
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white flex items-center gap-2 bg-gradient-to-r from-white to-green-100 text-2xl w-64 justify-center rounded-lg shadow-md font-semibold text-blue-800"> <Image
              width={100}
              height={100}
              className="h-7 w-7"
              alt="logo"
              src="https://i.postimg.cc/pLYBKqTW/farmer-Icon.png"
            />
            <h2>Admin Dashboard</h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Create New Field
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-md p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-md w-full mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600 text-center text-lg font-medium">
            Failed to fetch fields
          </p>
        ) : fields.length === 0 ? (
          <p className="text-gray-600 text-center text-lg font-medium">
            No fields found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div
                key={field.fieldId}
                className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transform transition-shadow duration-300"
              >
                <Image
                  src={field.fieldImage}
                  alt={field.fieldName}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-t-xl mb-4"
                />
                <div className="space-y-2 rounded-xl p-6 pb-0 pr-0 bg-amber-50">
                  <h3 className="text-lg font-semibold text-gray-800">{field.fieldName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      Lat {field.fieldLocation.latitude.toFixed(4)}, Long{' '}
                      {field.fieldLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span>{field.fieldCrop}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      Updated:{' '}
                      {field.updatedAt
                        ? new Date(field.updatedAt).toLocaleString().slice(0, 10)
                        : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Field ID:</span> {field.fieldId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Database ID:</span> {field._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Size:</span>{' '}
                    {field.fieldSizeInAcres ? `${field.fieldSizeInAcres} acres` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Soil Type:</span> {field.soilType || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Farmer ID:</span> {field.farmerId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Region:</span> {field.region || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span
                      className={
                        field.fieldStatus === 'active'
                          ? 'text-green-600'
                          : field.fieldStatus === 'inactive'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }
                    >
                      {' '}
                      {field.fieldStatus || 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Motor On:</span>{' '}
                    <span className={field.motorOn ? 'text-green-600' : 'text-gray-600'}>
                      {field.motorOn ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Shade On:</span>{' '}
                    <span className={field.shadeOn ? 'text-green-600' : 'text-gray-600'}>
                      {field.shadeOn ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <div className="flex justify-end gap-4 mt-4">
                    <a
                      href={`/fields/${field.fieldId}`}
                      className="inline-flex items-center justify-center bg-green-800 text-white py-2 px-4 rounded-tl-xl rounded-br-xl text-sm font-medium hover:bg-green-700 transition-colors duration-300"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <CreateFieldModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}