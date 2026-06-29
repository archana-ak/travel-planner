export interface TripInput {
  destination: string;
  startDate: string;
  endDate: string;
  numPeople: number;
  budget: number;
  currency: string;
  startPoint: string;
  endPoint: string;
}

export interface TransportOption {
  type: "flight" | "train" | "bus";
  provider: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  pricePerPerson: number;
  totalPrice: number;
  notes: string;
}

export interface PackingItem {
  category: string;
  items: string[];
}

export interface Place {
  name: string;
  category: "tourist_attraction" | "hidden_gem" | "nature" | "cultural" | "shopping";
  description: string;
  estimatedTime: string;
  cost: string;
}

export interface Activity {
  name: string;
  description: string;
  estimatedCost: string;
  bestTime: string;
}

export interface FoodRecommendation {
  name: string;
  type: "local_cuisine" | "street_food" | "restaurant" | "cafe" | "dessert";
  description: string;
  priceRange: string;
  mustTry: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    notes: string;
  }[];
}

export interface GeneratedItinerary {
  transport: TransportOption[];
  packingList: PackingItem[];
  places: Place[];
  activities: Activity[];
  foods: FoodRecommendation[];
  dayPlan: DayPlan[];
}
