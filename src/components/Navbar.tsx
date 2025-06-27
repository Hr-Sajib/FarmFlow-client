'use client';

import { usePathname } from 'next/navigation';
import useScrollDirection from '@/redux/hooks';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Navbar() {
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();

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
            <div className="space-x-4 text-sm sm:text-base text-gray-700">
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
              <Link
                href="/login"
                className={`hover:underline ${pathname === '/login' ? 'text-green-700' : ''}`}
              >
                Login
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}