'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/features/user/userSlice';
import Image from 'next/image';
import { useUpdateUserMutation } from '@/redux/features/user/userApi';
// import { useUpdateUserMutation } from '@/redux/features/user/userApi';

interface FarmerProfileUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FarmerProfileUpdate({ isOpen, onClose }: FarmerProfileUpdateProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    _id:'',
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id, // ✅ include _id
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || '',
      });
    }
  }, [user]);

  console.log("User to up: ",user)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Name, email, and phone are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const response = await updateUser(formData).unwrap();
      console.log('User updated:', response);
      dispatch(setUser(response));
      onClose();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-center">Update Profile</h2>
        <form onSubmit={handleSubmit}>
          
          {formData.photo && (
            <div className="flex justify-center">
              <Image
                src={formData.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
                alt="Profile preview"
                width={100}
                height={100}
                className="w-20 h-20 rounded-full border-3 border-green-700 object-cover"
              />
            </div>
          )}
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
              Photo URL
            </label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="https://example.com/photo.jpg"
            />
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
              disabled={isLoading}
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