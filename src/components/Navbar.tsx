"use client";

import useScrollDirection from "@/redux/hooks";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";


export default function Navbar() {
  const scrollDirection = useScrollDirection();

  return (
    <AnimatePresence>
      {scrollDirection === "up" && (
        <motion.nav
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 w-full bg-green-100 text-black px-6 py-4 shadow-md z-50"
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Image width={100} height={100} className="h-9 w-9" alt="logo" src="https://i.postimg.cc/Xq3PnTG5/logo1.png"></Image>
              <h1 className="text-xl font-bold tracking-wide"   style={{ fontFamily: "var(--font-kaushan-script)", color: "rgb(59, 107, 4)" }}>FarmFlow</h1>
            </div>
            <div className="space-x-4 text-sm sm:text-base">
              <Link href="/" className="hover:underline">Dashboard</Link>
              <Link href="/forum" className="hover:underline">Forum</Link>
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/report" className="hover:underline">Report</Link>
              <Link href="/login" className="hover:underline font-semibold">Login</Link>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

