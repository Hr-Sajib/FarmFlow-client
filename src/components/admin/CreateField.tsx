/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateFieldMutation } from '@/redux/features/fields/fieldsApi';
import { TField } from '@/types/types';

// Props interface for the modal
type CreateFieldModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

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
  const [isUploading, setIsUploading] = useState(false);
  const [buttonText, setButtonText] = useState('Create Field');

  // Handle input changes for text and select fields
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

  // Handle file selection for image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('CreateFieldModal: Image selected', {
        fileName: file.name,
        fileSize: file.size,
      });
      setImageFile(file);
    }
  };

  // Cloudinary image upload function
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      if (!file) {
        throw new Error('No image file selected');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      console.log('uploadImageToCloudinary: Initiating upload', {
        fileName: file.name,
        fileSize: file.size,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      console.log('uploadImageToCloudinary: Upload successful', {
        secureUrl: data.secure_url,
        publicId: data.public_id,
      });

      return data.secure_url;
    } catch (error: any) {
      console.error('uploadImageToCloudinary: Error', error.message);
      toast.error(`Failed to upload image: ${error.message}`);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setButtonText('Creating...');

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
      setFormError('All required fields must be filled');
      toast.error('Please fill in all required fields');
      setButtonText('Create Field');
      return;
    }

    // Validate latitude and longitude
    const latitude = parseFloat(formData.fieldLocation.latitude);
    const longitude = parseFloat(formData.fieldLocation.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      setFormError('Latitude and longitude must be valid numbers');
      toast.error('Invalid location coordinates');
      setButtonText('Create Field');
      return;
    }

    try {
      // Upload image if selected
      let imageUrl: string | undefined;
      if (imageFile) {
        setIsUploading(true);
        console.log('CreateFieldModal: Starting image upload for:', imageFile.name);
        imageUrl = await uploadImageToCloudinary(imageFile);
        console.log('CreateFieldModal: Image upload complete, URL:', imageUrl);
        setIsUploading(false);
        if (!imageUrl) {
          setFormError('Failed to upload image');
          console.log('CreateFieldModal: Error: Image upload failed');
          toast.error('Failed to upload image');
          setButtonText('Create Field');
          return;
        }
      }

      // Prepare payload for field creation
      const payload = {
        fieldName: formData.fieldName,
        fieldImage: imageUrl || undefined,
        fieldCrop: formData.fieldCrop,
        fieldLocation: { latitude, longitude },
        fieldSizeInAcres: formData.fieldSizeInAcres
          ? parseFloat(formData.fieldSizeInAcres)
          : undefined,
        soilType: formData.soilType || undefined,
        farmerId: formData.farmerId,
        region: formData.region || undefined,
        fieldStatus: formData.fieldStatus,
      };

      console.log('CreateFieldModal: Creating field with payload:', payload);
      await createField(payload).unwrap();
      console.log('CreateFieldModal: Field created successfully');
      toast.success('Field created successfully');

      // Show "Created" briefly before closing
      setButtonText('Created');
      setTimeout(() => {
        // Reset form
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
        setFormError('');
        setButtonText('Create Field');
        onClose();
      }, 1000); // 1-second delay to show "Created"
    } catch (err) {
      console.error('CreateFieldModal: Error creating field:', err);
      setIsUploading(false);
      setFormError('Failed to create field');
      toast.error('Failed to create field');
      setButtonText('Create Field');
    }
  };

  // Return null if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-3xl w-full">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Create New Field</h2>

        {/* Display form error */}
        {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Field Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Field Name *</label>
            <input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Field Image */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Field Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {isUploading && (
              <p className="text-sm text-gray-600 mt-1">Uploading image...</p>
            )}
          </div>

          {/* Crop */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Crop *</label>
            <input
              type="text"
              name="fieldCrop"
              value={formData.fieldCrop}
              onChange={handleInputChange}
              placeholder="Enter crop type"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Farmer ID */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Farmer ID *</label>
            <input
              type="text"
              name="farmerId"
              value={formData.farmerId}
              onChange={handleInputChange}
              placeholder="Enter farmer ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Latitude *</label>
            <input
              type="text"
              name="fieldLocation.latitude"
              value={formData.fieldLocation.latitude}
              onChange={handleInputChange}
              placeholder="Enter latitude"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Longitude *</label>
            <input
              type="text"
              name="fieldLocation.longitude"
              value={formData.fieldLocation.longitude}
              onChange={handleInputChange}
              placeholder="Enter longitude"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Size */}
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

          {/* Region */}
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

          {/* Soil Type */}
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

          {/* Status */}
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

          {/* Buttons */}
          <div className="col-span-2 flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUploading}
              className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}