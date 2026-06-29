"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-gray-900">TravelPlan</span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  My Trips
                </Link>
                <Link
                  href="/trip/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Plan a Trip
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm text-gray-600">
                    Hi, {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
