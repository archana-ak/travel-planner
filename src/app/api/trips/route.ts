import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { itinerary: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const data = await request.json();

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

  return NextResponse.json(trip);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("id");
  if (!tripId) {
    return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
  }

  await prisma.trip.delete({ where: { id: tripId } });
  return NextResponse.json({ success: true });
}
