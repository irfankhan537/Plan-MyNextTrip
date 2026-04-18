import { GoogleGenAI, Type } from "@google/genai";
import { TravelFormData, TravelPlanResult, TripType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function getMockSuggestions(month: string, tripType: string, budget: string): {name: string, reason: string}[] {
  let suggestions: {name: string, reason: string}[] = [];
  const isWinter = ["December", "January", "February"].includes(month);
  const isSummer = ["April", "May", "June"].includes(month);
  const isMonsoon = ["July", "August", "September"].includes(month);

  if (tripType === "National") {
    if (budget === "Low") {
      suggestions = [
        {name: "Goa", reason: "Budget-friendly stays and great beach vibes year-round."},
        {name: "Jaipur", reason: "Affordable heritage stays and rich culture."},
        {name: "Varanasi", reason: "Highly economical cultural and spiritual experience."},
        {name: "Rishikesh", reason: "Cheap hostels and free spiritual/yoga vibes."},
        {name: "Pondicherry", reason: "Inexpensive French-style cafes and relaxing beaches."}
      ];
    } else if (budget === "High") {
      suggestions = [
        {name: "Andaman", reason: "Premium scuba diving and luxury island resorts."},
        {name: "Ladakh", reason: "Exclusive high-altitude camps and premium biking tours."},
        {name: "Gulmarg, Kashmir", reason: "Luxury ski resorts and premium winter sports."},
        {name: "Udaipur", reason: "World-class heritage palace hotels and private lake tours."},
        {name: "Coorg", reason: "Five-star jungle resorts set across sprawling private coffee estates."}
      ];
    } else {
      if (isWinter) suggestions = [ 
        {name:"Goa", reason:"Perfect winter sun and pleasant beach weather."}, 
        {name:"Kerala", reason:"Great backwater cruising weather."}, 
        {name:"Jaipur", reason:"Comfortable weather for exploring historical forts without the heat."},
        {name:"Jaisalmer", reason:"Cool desert nights perfect for camel safaris and camping."},
        {name:"Rann of Kutch", reason:"Breathtaking white desert festival during pleasant winter months."}
      ];
      else if (isSummer) suggestions = [ 
        {name:"Manali", reason:"Cool mountain climate to escape the summer heat."}, 
        {name:"Darjeeling", reason:"Pleasant tea garden walks and cool Himalayan air."},
        {name:"Nainital", reason:"Refreshing lakes and cool hilly breeze."},
        {name:"Ooty", reason:"Lush green nilgiri hills offering a perfect summer escape."},
        {name:"Shimla", reason:"Classic hill station charm with comfortable daytime temperatures."}
      ];
      else if (isMonsoon) suggestions = [ 
        {name:"Udaipur", reason:"The lakes are full and the city looks magnificent in the rain."},
        {name:"Munnar", reason:"Spectacularly lush tea gardens covered in mist."},
        {name:"Lonavala", reason:"Beautiful waterfalls and foggy green valleys."},
        {name:"Meghalaya", reason:"Experience breathtaking living root bridges and epic waterfalls."},
        {name:"Coorg", reason:"Dark, moody, and deeply green coffee plantations in the rain."}
      ];
      else suggestions = [ 
        {name:"Amritsar", reason:"Pleasant climate for spiritual visits to the Golden Temple."},
        {name:"Agra", reason:"Comfortable weather to explore the Taj Mahal without extreme heat."},
        {name:"Mysore", reason:"Rich royal heritage with very balanced and mild weather."},
        {name:"Hampi", reason:"Explore ancient ruins without the harsh mid-summer sun."},
        {name:"Mahabaleshwar", reason:"Nice crisp weather and fresh strawberries in the transitional months."}
      ];
    }
  } else {
    // International
    if (budget === "Low") {
      suggestions = [
        {name: "Thailand", reason: "Extremely budget-friendly with amazing beaches and street food."},
        {name: "Vietnam", reason: "Highly affordable cultural experiences and cheap internal transport."},
        {name: "Bali", reason: "Great value for money with beautiful economical villas."},
        {name: "Sri Lanka", reason: "Short flight, cheap trains, and beautiful budget beach bungalows."},
        {name: "Cambodia", reason: "Exceptionally cheap food and affordable access to Angkor Wat."}
      ];
    } else if (budget === "High") {
      suggestions = [
        {name: "Switzerland", reason: "Premium alpine chalets and scenic luxury trains."},
        {name: "Paris", reason: "Luxury dining, high-end shopping, and premium tours."},
        {name: "New York", reason: "Exclusive Broadway shows and luxury metropolitan stays."},
        {name: "Bora Bora", reason: "The ultimate ultra-luxury overwater bungalows."},
        {name: "Tokyo", reason: "High-end omakase dining, luxury bullet trains, and luxury stays."}
      ];
    } else {
      if (isWinter) suggestions = [ 
        {name:"Dubai", reason:"Ideal outdoor weather, shopping festivals and desert safaris."}, 
        {name:"Maldives", reason:"Dry season with clear waters perfect for snorkeling."},
        {name:"Phuket", reason:"Perfect beach weather escaping the northern winter block."},
        {name:"Cape Town", reason:"Sunny and warm Southern Hemisphere summer weather."},
        {name:"Egypt", reason:"Cooler, pleasant weather perfectly suited to exploring the pyramids."}
      ];
      else if (isSummer) suggestions = [ 
        {name:"London", reason:"Pleasant long summer days, parks are lively, great outdoor events."},
        {name:"Amsterdam", reason:"Perfect canal-cruising weather and outdoor cafe culture."},
        {name:"Iceland", reason:"Experience the midnight sun and hike active volcano trails."},
        {name:"Vancouver", reason:"Warm and sunny, perfect for biking and mountain hiking."},
        {name:"Edinburgh", reason:"Comfortable festival season weather in the Scottish highlands."}
      ];
      else if (isMonsoon) suggestions = [ 
        {name:"Singapore", reason:"Great indoor attractions and food festivals to complement brief rain spells."}, 
        {name:"Sydney", reason:"Cool, comfortable winter weather in the southern hemisphere."},
        {name:"Bali", reason:"Actually the dry season in Indonesia, making it a perfect monsoon escape."},
        {name:"Fiji", reason:"Clear skies and peak surfing/diving conditions."},
        {name:"New Zealand", reason:"Crisp winter scenery and active winter sports in the south island."}
      ];
      else suggestions = [ 
        {name:"Tokyo", reason:"Stunning seasonal shifts, perfect for cherry blossoms or autumn foliage."}, 
        {name:"Rome", reason:"Fewer crowds and mild climate ideal for historical sightseeing."},
        {name:"Barcelona", reason:"Great Mediterranean weather, ideal for walking tours and tapas."},
        {name:"Istanbul", reason:"Comfortable weather to hop between Europe and Asia on the Bosphorus."},
        {name:"Kyoto", reason:"Perfect mild weather to enjoy traditional temples and gardens."}
      ];
    }
  }
  
  return suggestions;
}

export async function generateTravelPlan(data: TravelFormData): Promise<TravelPlanResult> {
  const daysText = (data.duration || "").toLowerCase();
  let daysMultiplier = 3;
  const matches = daysText.match(/\d+/g);
  if (matches && matches.length > 0) {
    daysMultiplier = Math.max(...matches.map(Number));
    if (daysText.includes("week")) daysMultiplier *= 7;
    if (daysText.includes("month")) daysMultiplier *= 30;
  }
  daysMultiplier = Math.min(Math.max(daysMultiplier, 1), 30);

  let budgetValue = 14000;
  if (data.tripType === "International") {
    if (data.budget === "Low") budgetValue = 42500;
    else if (data.budget === "Medium") budgetValue = 105000;
    else if (data.budget === "High") budgetValue = 200000;
  } else {
    // National
    if (data.budget === "Low") budgetValue = 5500;
    else if (data.budget === "Medium") budgetValue = 14000;
    else if (data.budget === "High") budgetValue = 35000;
  }

  const baseAccomodationFoodCost = data.travelers * budgetValue;

  let finalDestination = data.destination;

  const prompt = `Act as an expert travel planner. Based on user's travel preferences, generate a detailed travel plan.
User Preferences:
- Current Location: ${data.currentLocation}
- Trip Type: ${data.tripType}
- Destination: ${finalDestination}
- Travelers: ${data.travelers}
- Duration: ${data.duration} -> Approx ${daysMultiplier} Days
- Budget Level: ${data.budget} (Approx ${budgetValue} INR per person for the entire trip)
- Travelling with: ${data.travelWith}
- Interests: ${data.interests.join(", ")}
- Main Travel Problems: ${data.problems.join(", ")}

Generate a response in JSON format matching the schema provided.
CRITICAL CALCULATION: 
totalEstimatedCost = Travel/Transport Cost + (${baseAccomodationFoodCost} INR).
costPerPerson = totalEstimatedCost / ${data.travelers}.
Give realistic dummy names for hotels and food places. Focus safety tips on Travel Problems.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          route: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING } }, required: ["from", "to"] },
          travelOptions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, estimatedCost: { type: Type.NUMBER } }, required: ["type", "description", "estimatedCost"] } },
          totalEstimatedCost: { type: Type.NUMBER },
          costPerPerson: { type: Type.NUMBER },
          hotelSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING }, pricePerNight: { type: Type.NUMBER } }, required: ["name", "type", "description", "pricePerNight"] } },
          foodRecommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "type", "description"] } },
          dayWisePlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["day", "title", "activities"] } },
          safetyTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["route", "travelOptions", "totalEstimatedCost", "costPerPerson", "hotelSuggestions", "foodRecommendations", "dayWisePlan", "safetyTips"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  try {
    const parsedData = JSON.parse(jsonStr) as TravelPlanResult;
    return parsedData;
  } catch (error) {
    console.error("Failed to parse JSON response", error);
    throw new Error("Failed to generate travel plan.");
  }
}
