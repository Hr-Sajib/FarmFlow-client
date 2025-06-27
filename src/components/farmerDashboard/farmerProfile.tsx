'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/features/user/userSlice';
import Image from 'next/image';
import { useGetMeMutation } from '@/redux/features/user/userApi';
import FarmerProfileUpdate from './FarmerProfileUpdate';

export default function FarmerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);
  const [getMe] = useGetMeMutation();
  const [isOpen, setIsOpen] = useState(false);

  const fetchUser = useCallback(() => {
    if (token) {
      getMe()
        .unwrap()
        .then((userData) => {
          dispatch(setUser(userData.data));
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
        });
    }
  }, [getMe, dispatch, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleCloseModal = () => {
    setIsOpen(false);
    fetchUser(); // ✅ Refresh user data after modal closes
  };

  return (
    <div className="w-[20vw]">
      {user ? (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white h-10 ml-2 px-[2px] hover:border hover:shadow-md rounded-2xl border-gray-300 items-center flex gap-2.5 w-40 px-1.4 mx-auto transition-all duration-150"
          >
            <Image
              src={user.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
              alt="User Photo"
              width={100}
              height={100}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-left">{user.name}</p>
              <p className="text-[13px] font-bold text-gray-600">{user.phone}</p>
            </div>
          </button>

          {/* ✅ Modal component with proper close handler */}
          <FarmerProfileUpdate isOpen={isOpen} onClose={handleCloseModal} />
        </>
      ) : (
        <p className="text-gray-600 text-center">No user data found.</p>
      )}
    </div>
  );
}
