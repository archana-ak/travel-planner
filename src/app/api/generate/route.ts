import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateItinerary } from "@/lib/ai";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Please login first" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Groq API key not configured. Please add your key to the .env file." },
      { status: 500 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const data = await request.json();

  try {
    const trip = await prisma.trip.create({
      data: {
        userId,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        numPeople: data.numPeople,
        budget: data.budget,
        currency: data.currency || "EUR",
        startPoint: data.startPoint,
        endPoint: data.endPoint,
      },
    });

    const itinerary = await generateItinerary(data);

    await prisma.itinerary.create({
      data: {
        tripId: trip.id,
        transport: JSON.stringify(itinerary.transport),
        packingList: JSON.stringify(itinerary.packingList),
        places: JSON.stringify(itinerary.places),
        activities: JSON.stringify(itinerary.activities),
        foods: JSON.stringify(itinerary.foods),
        dayPlan: JSON.stringify(itinerary.dayPlan),
      },
    });

    return NextResponse.json({ tripId: trip.id, itinerary });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate itinerary: ${message}` },
      { status: 500 }
    );
  }
}
