import OpenAI from "openai";
import { TripInput, GeneratedItinerary } from "@/types";

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateItinerary(trip: TripInput): Promise<GeneratedItinerary> {
  const prompt = `You are a travel planning expert. Generate a comprehensive travel itinerary based on the following details:

**Travel Details:**
- Destination: ${trip.destination}
- Travel Dates: ${trip.startDate} to ${trip.endDate}
- Number of Travelers: ${trip.numPeople}
- Total Budget: ${trip.budget} ${trip.currency}
- Starting Point: ${trip.startPoint}
- Ending Point: ${trip.endPoint}

Generate a detailed travel plan in JSON format with the following structure. Be realistic with prices and timings. Consider the season/weather for the travel dates when suggesting packing items.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "transport": [
    {
      "type": "flight" | "train" | "bus",
      "provider": "airline/company name",
      "departureTime": "HH:MM",
      "arrivalTime": "HH:MM",
      "duration": "Xh Ym",
      "pricePerPerson": number,
      "totalPrice": number (pricePerPerson * ${trip.numPeople}),
      "notes": "any relevant info"
    }
  ],
  "packingList": [
    {
      "category": "Clothing" | "Electronics" | "Toiletries" | "Documents" | "Miscellaneous",
      "items": ["item1", "item2"]
    }
  ],
  "places": [
    {
      "name": "place name",
      "category": "tourist_attraction" | "hidden_gem" | "nature" | "cultural" | "shopping",
      "description": "brief description",
      "estimatedTime": "X hours",
      "cost": "free or estimated cost"
    }
  ],
  "activities": [
    {
      "name": "activity name",
      "description": "what to expect",
      "estimatedCost": "cost per person",
      "bestTime": "morning/afternoon/evening"
    }
  ],
  "foods": [
    {
      "name": "dish or restaurant name",
      "type": "local_cuisine" | "street_food" | "restaurant" | "cafe" | "dessert",
      "description": "what it is",
      "priceRange": "€X-€Y per person",
      "mustTry": true/false
    }
  ],
  "dayPlan": [
    {
      "day": 1,
      "date": "${trip.startDate}",
      "title": "Day theme",
      "activities": [
        {
          "time": "09:00",
          "activity": "what to do",
          "location": "where",
          "notes": "tips"
        }
      ]
    }
  ]
}

Important guidelines:
- Provide 2-3 transport options that fit within the total budget of ${trip.budget} ${trip.currency} for ${trip.numPeople} people
- The packing list should be specific to the season/weather at ${trip.destination} during ${trip.startDate} to ${trip.endDate}
- Include at least 8-10 places across different categories
- Include 5-7 must-do activities
- Include 8-10 food recommendations with at least 3 marked as mustTry
- Create a day-by-day plan for each day of the trip
- All prices should be in ${trip.currency}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No response from AI");
  }

  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/,"");

  const parsed = JSON.parse(text) as GeneratedItinerary;
  return parsed;
}
