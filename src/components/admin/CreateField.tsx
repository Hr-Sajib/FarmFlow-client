'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateFieldMutation } from '@/redux/features/fields/fieldsApi';
import { TField } from '@/types/types';
import { postImage } from '@/utils/postImage';

type CreateFieldModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateFieldModal({ isOpen, onClose }: CreateFieldModalProps) {
  const [createField, { isLoading: isCreating }] = useCreateFieldMutation();
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldImage: '',
    fieldCrop: '',
    fieldLocation: { latitude: '', longitude: '' },
    fieldSizeInAcres: '',
    soilType: '' as TField['soilType'],
    farmerId: '',
    region: '',
    fieldStatus: 'active' as TField['fieldStatus'],
  });
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('fieldLocation.')) {
      const key = name.split('.')[1] as 'latitude' | 'longitude';
      setFormData((prev) => ({
        ...prev,
        fieldLocation: { ...prev.fieldLocation, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (
      !formData.fieldName ||
      !formData.fieldCrop ||
      !formData.fieldLocation.latitude ||
      !formData.fieldLocation.longitude ||
      !formData.farmerId ||
      !formData.fieldStatus ||
      !imageFile
    ) {
      setFormError('All required fields (name, crop, location, farmer ID, status, image) must be filled');
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate latitude and longitude
    const latitude = parseFloat(formData.fieldLocation.latitude);
    const longitude = parseFloat(formData.fieldLocation.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      setFormError('Latitude and longitude must be valid numbers');
      toast.error('Invalid location coordinates');
      return;
    }

    try {
      // Upload image
      const imageUrl = await postImage(imageFile);
      const payload = {
        fieldName: formData.fieldName,
        fieldImage: imageUrl,
        fieldCrop: formData.fieldCrop,
        fieldLocation: {
          latitude,
          longitude,
        },
        fieldSizeInAcres: formData.fieldSizeInAcres ? parseFloat(formData.fieldSizeInAcres) : undefined,
        soilType: formData.soilType || undefined,
        farmerId: formData.farmerId,
        region: formData.region || undefined,
        fieldStatus: formData.fieldStatus,
      };
      console.log('CreateFieldModal - Creating field with payload:', payload);
      await createField(payload).unwrap();
      toast.success('Field created successfully');
      setFormData({
        fieldName: '',
        fieldImage: '',
        fieldCrop: '',
        fieldLocation: { latitude: '', longitude: '' },
        fieldSizeInAcres: '',
        soilType: '',
        farmerId: '',
        region: '',
        fieldStatus: 'active',
      });
      setImageFile(null);
      onClose(); // Close modal on success
    } catch (err) {
      console.error('CreateFieldModal - Error creating field:', err);
      setFormError('Failed to create field');
      toast.error('Failed to create field');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-3xl w-full">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Create New Field</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Field Name *</label>
            <input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Field Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Crop *</label>
            <input
              type="text"
              name="fieldCrop"
              value={formData.fieldCrop}
              onChange={handleInputChange}
              placeholder="Enter crop type"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Farmer ID *</label>
            <input
              type="text"
              name="farmerId"
              value={formData.farmerId}
              onChange={handleInputChange}
              placeholder="Enter farmer ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Latitude *</label>
            <input
              type="text"
              name="fieldLocation.latitude"
              value={formData.fieldLocation.latitude}
              onChange={handleInputChange}
              placeholder="Enter latitude"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Longitude *</label>
            <input
              type="text"
              name="fieldLocation.longitude"
              value={formData.fieldLocation.longitude}
              onChange={handleInputChange}
              placeholder="Enter longitude"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Size (acres)</label>
            <input
              type="number"
              name="fieldSizeInAcres"
              value={formData.fieldSizeInAcres}
              onChange={handleInputChange}
              placeholder="Enter size in acres"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="Enter region"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Soil Type</label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select soil type</option>
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sandy">Sandy</option>
              <option value="silt">Silt</option>
              <option value="peat">Peat</option>
              <option value="chalk">Chalk</option>
              <option value="saline">Saline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status *</label>
            <select
              name="fieldStatus"
              value={formData.fieldStatus}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="col-span-2">
            {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isCreating ? 'Creating...' : 'Create Field'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}