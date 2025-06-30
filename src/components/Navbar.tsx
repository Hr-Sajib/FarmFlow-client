'use client';

import { usePathname } from 'next/navigation';
import useScrollDirection, { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RootState } from '@/redux/store';
import FarmerProfile from './farmerDashboard/farmerProfile';
import { logout } from '@/redux/features/auth/authSlice';
import { clearCurrentUser } from '@/redux/features/currentUser/currentUserSlice';

export default function Navbar() {
  const { currentUser } = useAppSelector((state: RootState) => state.currentUser);
  const dispatch = useAppDispatch();

  const scrollDirection = useScrollDirection();
  const pathname = usePathname();

  console.log("in nav cur: ",currentUser)

  return (
    <AnimatePresence>
      {scrollDirection === 'up' && (
        <motion.nav
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 w-full bg-green-100 text-black px-6 py-4 shadow-md z-50"
        >
          <div className="max-w-6xl mx-auto flex justify-between font-semibold items-center">
            <Link href="/" className="flex items-center gap-1">
              <Image
                width={100}
                height={100}
                className="h-9 w-9"
                alt="logo"
                src="https://i.postimg.cc/Xq3PnTG5/logo1.png"
              />
              <h1
                className="text-xl font-bold tracking-wide"
                style={{ fontFamily: 'var(--font-kaushan-script)', color: 'rgb(59, 107, 4)' }}
              >
                FarmFlow
              </h1>
            </Link>
            <div className="space-x-4 flex items-center text-sm sm:text-base text-gray-700">
              <Link
                href="/"
                className={`hover:underline ${pathname === '/' ? 'text-green-700' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/forum"
                className={`hover:underline ${pathname === '/forum' ? 'text-green-700' : ''}`}
              >
                Forum
              </Link>
              <Link
                href="/chat"
                className={`hover:underline ${pathname === '/chat' ? 'text-green-700' : ''}`}
              >
                Chat
              </Link>
              <Link
                href="/about"
                className={`hover:underline ${pathname === '/about' ? 'text-green-700' : ''}`}
              >
                About
              </Link>
              <Link
                href="/report"
                className={`hover:underline ${pathname === '/report' ? 'text-green-700' : ''}`}
              >
                Report
              </Link>
              {
                currentUser ?

                <div className='flex gap-2'>
                  <button onClick={()=>{
                    console.log("log out clicked..")
                    localStorage.removeItem("accessToken");
                    dispatch(logout());
                    dispatch(clearCurrentUser());
                  }} >Logout</button>
                  <FarmerProfile/>

                </div>

     
                :
              <Link
                  href="/login"
                  className={`hover:underline ${pathname === '/login' ? 'text-green-700' : ''}`}
                >
                  Login
              </Link>
              }
              
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}