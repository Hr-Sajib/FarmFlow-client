'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/features/user/userSlice';
import Image from 'next/image';
import { useGetMeQuery } from '@/redux/features/user/userApi';


export default function FarmerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, error, isSuccess } = useGetMeQuery(undefined, {
    skip: !token, // only fetch if token is present
  });

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
      console.log('User data fetched and dispatched:', data);
    }
  }, [data, dispatch]);

  return (
    <div className="w-[20vw] border">
      {isLoading ? (
        <p className="text-gray-600 text-center">Loading user profile...</p>
      ) : error ? (
        <p className="text-red-600 text-center">
          {'status' in error && error.status === 401
            ? 'You are not authorized. Please log in.'
            : 'Failed to load user profile.'}
        </p>
      ) : !user ? (
        <p className="text-gray-600 text-center">No user data found.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg flex shadow-md max-w-md mx-auto">
          <Image
            src={user.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
            alt="photo loading"
            width={100}
            height={100}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-4">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}
