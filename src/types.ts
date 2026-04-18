export type TripType = "National" | "International";
export type Duration = string;
export type BudgetLevel = "Low" | "Medium" | "High" | string;
export type TravelWith = "Solo" | "Friends" | "Family" | "Couple";

export interface TravelFormData {
  currentLocation: string;
  wantsAiSuggestion: "Yes" | "No" | "";
  travelMonth: string;
  tripType: TripType | "";
  destination: string;
  travelers: number;
  duration: Duration | "";
  budget: BudgetLevel | "";
  travelWith: TravelWith | "";
  interests: string[];
  problems: string[];
}

export interface TravelPlanResult {
  route: {
    from: string;
    to: string;
  };
  travelOptions: {
    type: string;
    description: string;
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
  costPerPerson: number;
  hotelSuggestions: {
    name: string;
    type: string;
    description: string;
    pricePerNight: number;
  }[];
  foodRecommendations: {
    name: string;
    type: string;
    description: string;
  }[];
  dayWisePlan: {
    day: number;
    title: string;
    activities: string[];
  }[];
  safetyTips: string[];
  recommendedPlaces?: {
    name: string;
    reason: string;
  }[];
}
