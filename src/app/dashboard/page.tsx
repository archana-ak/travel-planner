"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numPeople: number;
  budget: number;
  currency: string;
  startPoint: string;
  endPoint: string;
  createdAt: string;
  itinerary: { id: string } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchTrips();
    }
  }, [status]);

  const fetchTrips = async () => {
    const res = await fetch("/api/trips");
    if (res.ok) {
      const data = await res.json();
      setTrips(data);
    }
    setLoading(false);
  };

  const deleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-gray-600 mt-1">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <Link
          href="/trip/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">✈️</p>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-gray-600 mb-6">
            Start planning your first adventure!
          </p>
          <Link
            href="/trip/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <h3 className="text-lg font-bold">{trip.destination}</h3>
                <p className="text-blue-100 text-sm">
                  {trip.startDate} → {trip.endDate}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>👥 {trip.numPeople} traveler{trip.numPeople > 1 ? "s" : ""}</p>
                  <p>💰 {trip.budget} {trip.currency}</p>
                  <p>📍 {trip.startPoint} → {trip.endPoint}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="flex-1 text-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Itinerary
                  </Link>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
