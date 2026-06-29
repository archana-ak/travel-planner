import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Plan Your Perfect Trip with AI
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Tell us where you want to go, and our AI will create a complete
            itinerary with transport options, packing lists, places to visit,
            local food recommendations, and a day-by-day schedule.
          </p>
          <Link
            href="/trip/new"
            className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Planning
          </Link>
        </div>
      </section>

      {/* Ad between hero and features */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdBanner slot="YOUR_AD_SLOT_1" format="horizontal" />
      </div>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Everything You Need for Your Trip
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🚆"
            title="Smart Transport"
            description="Get flight, train, and bus options that fit your budget. Compare prices for your group size."
          />
          <FeatureCard
            icon="🎒"
            title="Season-Smart Packing"
            description="AI-generated packing lists tailored to the weather and culture of your destination."
          />
          <FeatureCard
            icon="📍"
            title="Places & Activities"
            description="Discover tourist attractions, hidden gems, and must-do experiences curated for you."
          />
          <FeatureCard
            icon="🍜"
            title="Local Food Guide"
            description="Never miss the best local cuisine, street food, and restaurants at your destination."
          />
          <FeatureCard
            icon="📅"
            title="Day-by-Day Plan"
            description="A complete daily schedule optimized for time and location, so you make the most of every day."
          />
          <FeatureCard
            icon="💰"
            title="Budget Aware"
            description="All recommendations respect your budget. See costs upfront for everything."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Next Adventure?</h2>
          <p className="text-gray-300 mb-8">
            Create a free account and generate your first itinerary in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
