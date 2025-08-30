
'use client';

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { setCurrentUser } from '@/redux/features/currentUser/currentUserSlice';
import Image from 'next/image';
import { useGetMeMutation } from '@/redux/features/currentUser/currentUserApi';

export default function FarmerProfile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.currentUser);
  const { token } = useSelector((state: RootState) => state.auth);
  const [getMe] = useGetMeMutation();

  const fetchUser = useCallback(() => {
    if (token) {
      getMe()
        .unwrap()
        .then((userData) => {
          dispatch(setCurrentUser(userData.data));
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
        });
    }
  }, [getMe, dispatch, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleClick = () => {
    router.push('/profile');
  };

  return (
    <div className="">
      {currentUser ? (
        <button
          onClick={handleClick}
          className="bg-white h-10 ml-2 px-[2px] hover:border rounded-2xl border-gray-300 items-center flex gap-2.5 w-40 px-1.4 mx-auto transition-all duration-150"
        >
          <Image
            src={currentUser.photo || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
            alt="User Photo"
            width={100}
            height={100}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-left">{currentUser.name}</p>
            <p className="text-[13px] font-bold text-gray-600">{currentUser.phone}</p>
          </div>
        </button>
      ) : (
        <p className="text-gray-600 text-center">No user data found.</p>
      )}
    </div>
  );
}
