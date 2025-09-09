/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCurrentUser } from '@/redux/features/currentUser/currentUserSlice';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useUpdateUserMutation } from '@/redux/features/currentUser/currentUserApi';

// Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Cloudinary uploader function
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    if (!file) {
      throw new Error('No image file selected');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    console.log('FarmerProfileUpdate: Initiating image upload', {
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
    console.log('FarmerProfileUpdate: Image upload successful', {
      secureUrl: data.secure_url,
      publicId: data.public_id,
    });

    return data.secure_url;
  } catch (error: any) {
    console.error('FarmerProfileUpdate: Error uploading image:', error.message);
    toast.error(`Failed to upload image: ${error.message}`);
    throw error;
  }
};

interface FarmerProfileUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FarmerProfileUpdate({ isOpen, onClose }: FarmerProfileUpdateProps) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.currentUser);
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        _id: currentUser._id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        photo: currentUser.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png',
      });
    }
  }, [currentUser]);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('FarmerProfileUpdate: Image selected, uploading...', { fileName: file.name, fileSize: file.size });
      setIsUploading(true);
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        console.log('FarmerProfileUpdate: Image uploaded, URL:', imageUrl);
        setFormData((prev) => ({ ...prev, photo: imageUrl }));
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('FarmerProfileUpdate: Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Name, email, and phone are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      console.log('FarmerProfileUpdate: Submitting update with payload:', formData);
      const response = await updateUser(formData).unwrap();
      console.log('FarmerProfileUpdate: User updated:', response);
      dispatch(setCurrentUser(response.data));
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      console.error('FarmerProfileUpdate: Failed to update user:', err);
      toast.error('Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4">
            <Image
              src={formData.photo}
              alt="Profile preview"
              width={100}
              height={100}
              className="w-20 h-20 rounded-full border-3 border-green-700 object-cover"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center mb-4">
              {'status' in error && error.status === 401
                ? 'You are not authorized. Please log in.'
                : 'Failed to update profile.'}
            </p>
          )}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              disabled
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 bg-gray-200 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Profile Photo
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            />
            {isUploading && <p className="text-sm text-gray-600 mt-1">Uploading image...</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}