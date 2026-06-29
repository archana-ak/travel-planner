"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GeneratedItinerary } from "@/types";

interface TripData {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numPeople: number;
  budget: number;
  currency: string;
  startPoint: string;
  endPoint: string;
  itinerary: {
    transport: string;
    packingList: string;
    places: string;
    activities: string;
    foods: string;
    dayPlan: string;
  } | null;
}

type Tab = "transport" | "packing" | "places" | "activities" | "foods" | "dayplan";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("transport");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchTrip();
    }
  }, [status]);

  const fetchTrip = async () => {
    const res = await fetch(`/api/trips/${params.id}`);
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }
    const data = await res.json();
    setTrip(data);
    if (data.itinerary) {
      setItinerary({
        transport: JSON.parse(data.itinerary.transport),
        packingList: JSON.parse(data.itinerary.packingList),
        places: JSON.parse(data.itinerary.places),
        activities: JSON.parse(data.itinerary.activities),
        foods: JSON.parse(data.itinerary.foods),
        dayPlan: JSON.parse(data.itinerary.dayPlan),
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!trip || !itinerary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Trip not found.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "transport", label: "Transport", icon: "🚆" },
    { key: "packing", label: "Packing List", icon: "🎒" },
    { key: "places", label: "Places", icon: "📍" },
    { key: "activities", label: "Activities", icon: "⭐" },
    { key: "foods", label: "Food", icon: "🍜" },
    { key: "dayplan", label: "Day Plan", icon: "📅" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Trip Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">{trip.destination}</h1>
        <div className="flex flex-wrap gap-4 text-blue-100">
          <span>{trip.startDate} → {trip.endDate}</span>
          <span>|</span>
          <span>{trip.numPeople} traveler{trip.numPeople > 1 ? "s" : ""}</span>
          <span>|</span>
          <span>Budget: {trip.budget} {trip.currency}</span>
          <span>|</span>
          <span>{trip.startPoint} → {trip.endPoint}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === "transport" && <TransportSection data={itinerary.transport} currency={trip.currency} />}
        {activeTab === "packing" && <PackingSection data={itinerary.packingList} />}
        {activeTab === "places" && <PlacesSection data={itinerary.places} />}
        {activeTab === "activities" && <ActivitiesSection data={itinerary.activities} />}
        {activeTab === "foods" && <FoodsSection data={itinerary.foods} />}
        {activeTab === "dayplan" && <DayPlanSection data={itinerary.dayPlan} />}
      </div>
    </div>
  );
}

function TransportSection({ data, currency }: { data: GeneratedItinerary["transport"]; currency: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Transport Options</h2>
      <div className="grid gap-4">
        {data.map((option, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {option.type === "flight" ? "✈️" : option.type === "train" ? "🚆" : "🚌"}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{option.provider}</h3>
                  <p className="text-sm text-gray-500 capitalize">{option.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{option.totalPrice} {currency}</p>
                <p className="text-sm text-gray-500">{option.pricePerPerson} {currency}/person</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>🕐 {option.departureTime} → {option.arrivalTime}</span>
              <span>⏱️ {option.duration}</span>
            </div>
            {option.notes && <p className="mt-2 text-sm text-gray-500">{option.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PackingSection({ data }: { data: GeneratedItinerary["packingList"] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Packing List</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {data.map((category, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
            <ul className="space-y-2">
              {category.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacesSection({ data }: { data: GeneratedItinerary["places"] }) {
  const categories = [...new Set(data.map((p) => p.category))];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Places to Visit</h2>
      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="font-semibold text-lg mb-3 capitalize">
            {cat.replace("_", " ")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data
              .filter((p) => p.category === cat)
              .map((place, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{place.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>⏱️ {place.estimatedTime}</span>
                    <span>💰 {place.cost}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitiesSection({ data }: { data: GeneratedItinerary["activities"] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Must-Do Activities</h2>
      <div className="grid gap-4">
        {data.map((activity, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-lg">{activity.name}</h3>
            <p className="text-gray-600 mt-1">{activity.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>💰 {activity.estimatedCost}</span>
              <span>🕐 Best time: {activity.bestTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodsSection({ data }: { data: GeneratedItinerary["foods"] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Food & Drink Recommendations</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((food, i) => (
          <div key={i} className={`border rounded-xl p-4 ${food.mustTry ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{food.name}</h3>
              {food.mustTry && (
                <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                  Must Try!
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{food.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span className="capitalize">{food.type.replace("_", " ")}</span>
              <span>💰 {food.priceRange}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayPlanSection({ data }: { data: GeneratedItinerary["dayPlan"] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Day-by-Day Schedule</h2>
      <div className="space-y-6">
        {data.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-lg mb-1">
              Day {day.day}: {day.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{day.date}</p>
            <div className="space-y-3">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-4 pl-4 border-l-2 border-blue-200">
                  <span className="text-sm font-mono text-blue-600 whitespace-nowrap">
                    {act.time}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{act.activity}</p>
                    <p className="text-sm text-gray-500">
                      📍 {act.location}
                      {act.notes && ` — ${act.notes}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
