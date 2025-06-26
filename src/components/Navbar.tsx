// app/components/Navbar.tsx
"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-green-100 text-black px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">🌾 FarmFlow</h1>
        <div className="space-x-4 text-sm sm:text-base">
          <Link href="/" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/forum" className="hover:underline">
            Forum
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/report" className="hover:underline">
            Report
          </Link>
        </div>
      </div>
    </nav>
  );
}
