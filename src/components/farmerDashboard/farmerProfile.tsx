'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/features/user/userSlice';
import Image from 'next/image';
import { useGetMeMutation } from '@/redux/features/user/userApi';

export default function FarmerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);
  const [getMe, { data, isLoading, error, isUninitialized, isSuccess, isError }] = useGetMeMutation();


  console.log('User fetched:', data);

  useEffect(() => {
    if (token) {
      console.log('Triggering getMe mutation...');
      getMe()
        .unwrap()
        .then((userData) => {
          console.log('User data fetched:', userData);
          dispatch(setUser(userData.data));
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
        });
    } else if (user) {
      console.log('User data from Redux:', user);
    } else {
      console.warn('No auth token available for getMe request');
    }
  }, [getMe, dispatch, token]);

  return (
    <div className="w-[20vw]">
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
        // small profile part 
        <div className="bg-white h-10 ml-2 hover:bg-green-100 hover:shadow-md rounded-full flex gap-2.5 w-40 px-2 mx-auto">
          <Image
            src={user.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
            alt="photo loading"
            width={100}
            height={100}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="">
            <p className="font-semibold">{user.name}</p>
            <p className="text-[13px] font-bold text-gray-600">{user.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}