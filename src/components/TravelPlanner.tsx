import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Calendar, Compass, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { TravelFormData, TripType, Duration, BudgetLevel, TravelWith } from '../types';

const INITIAL_FORM_DATA: TravelFormData = {
  currentLocation: "",
  wantsAiSuggestion: "",
  travelMonth: "",
  tripType: "",
  destination: "",
  travelers: 1,
  duration: "",
  budget: "",
  travelWith: "",
  interests: [],
  problems: [],
};

const NATIONAL_DESTINATIONS = ["Darjeeling", "Goa", "Manali", "Jaipur", "Kerala", "Ladakh", "Andaman", "Amritsar", "Delhi", "Kashmir", "Varanasi", "Udaipur", "Agra", "Shimla"];
const INTERNATIONAL_DESTINATIONS = ["Dubai", "Thailand", "Singapore", "Maldives", "Bali", "Paris", "Switzerland", "London", "Tokyo", "New York", "Rome", "Sydney"];
const DURATIONS: Duration[] = ["2-3 Days", "4-7 Days", "7-14 Days"];
const NATIONAL_BUDGETS: { label: BudgetLevel, amount: string }[] = [
  { label: "Low", amount: "₹3,000 - ₹8,000" },
  { label: "Medium", amount: "₹8,000 - ₹20,000" },
  { label: "High", amount: "₹20,000 - ₹50,000+" }
];
const INTERNATIONAL_BUDGETS: { label: BudgetLevel, amount: string }[] = [
  { label: "Low", amount: "₹25,000 - ₹60,000" },
  { label: "Medium", amount: "₹60,000 - ₹1,50,000" },
  { label: "High", amount: "₹1,50,000+" }
];
const TRAVEL_WITH: TravelWith[] = ["Solo", "Friends", "Family", "Couple"];
const INTERESTS = ["Food 🍜", "Nature 🌿", "Adventure 🧗", "Historical 🏛️", "Shopping 🛍️"];
const PROBLEMS = [
  "I don’t know how to plan my trip",
  "Need budget-friendly hotels",
  "Want best food places",
  "Safety concerns",
  "Transport confusion"
];

interface TravelPlannerProps {
  onGenerate: (data: TravelFormData) => void;
  isLoading: boolean;
}

export default function TravelPlanner({ onGenerate, isLoading }: TravelPlannerProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TravelFormData>(INITIAL_FORM_DATA);

  const stepKeys = [
    'location',
    'aiOption',
    'tripType',
    ...(formData.wantsAiSuggestion === 'Yes' ? [] : ['destination']),
    'travelers',
    'duration',
    'budget',
    'with',
    'interests',
    'problems',
    'submit'
  ];
  const totalSteps = stepKeys.length;
  const currentStepKey = stepKeys[step - 1] || 'submit';

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (field: keyof TravelFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'tripType' && prev.tripType !== value) {
        newData.destination = "";
      }
      return newData;
    });
  };

  const toggleArrayItem = (field: 'interests' | 'problems', item: string) => {
    setFormData(prev => {
      const list = prev[field] as string[];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            handleChange("currentLocation", data.city || data.locality || "My Current Location");
          } catch (e) {
            handleChange("currentLocation", "My Current Location");
          }
        },
        () => {
          alert("Could not get location.");
        }
      );
    }
  };

  const isStepValid = () => {
    switch (currentStepKey) {
      case 'location': return formData.currentLocation.trim().length > 0;
      case 'aiOption': return formData.wantsAiSuggestion === "No" || (formData.wantsAiSuggestion === "Yes" && formData.travelMonth !== "");
      case 'tripType': return formData.tripType !== "";
      case 'destination': return formData.destination !== "";
      case 'travelers': return formData.travelers > 0;
      case 'duration': return formData.duration !== "";
      case 'budget': return formData.budget !== "";
      case 'with': return formData.travelWith !== "";
      case 'interests': return formData.interests.length > 0;
      case 'problems': return formData.problems.length > 0;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStepKey) {
      case 'location':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Where are you starting from?</h2>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={formData.currentLocation}
                onChange={(e) => handleChange("currentLocation", e.target.value)}
                placeholder="Enter your current city"
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-xl px-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
              />
            </div>
            <button 
              onClick={handleUseLocation}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium px-2 py-1 rounded transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Use My Location
            </button>
          </div>
        );
      case 'aiOption':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Do you want AI suggestions for where to travel?</h2>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                onClick={() => { handleChange('wantsAiSuggestion', 'Yes'); if(formData.travelMonth) setTimeout(handleNext, 300); }}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${formData.wantsAiSuggestion === 'Yes' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium tracking-wide shadow-sm' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
              >Yes</button>
              <button
                onClick={() => { handleChange('wantsAiSuggestion', 'No'); setTimeout(handleNext, 300); }}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${formData.wantsAiSuggestion === 'No' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium tracking-wide shadow-sm' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
              >No</button>
            </div>
            <AnimatePresence>
              {formData.wantsAiSuggestion === 'Yes' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-gray-200/50 dark:border-slate-700/50 overflow-hidden"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select your travel month</label>
                  <select 
                    value={formData.travelMonth}
                    onChange={(e) => handleChange('travelMonth', e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-slate-100"
                  >
                    <option value="" disabled>Select Month...</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'tripType':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">What type of trip are you planning?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["National", "International"] as TripType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { handleChange('tripType', type); setTimeout(handleNext, 300); }}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.tripType === type ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md' : 'border-transparent bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60'}`}
                >
                  <Compass className={`w-8 h-8 ${formData.tripType === type ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="text-xl font-medium">{type} Trip</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'destination':
        const destinations = formData.tripType === "National" ? NATIONAL_DESTINATIONS : INTERNATIONAL_DESTINATIONS;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Where do you want to go?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {destinations.map(dest => (
                <button
                  key={dest}
                  onClick={() => handleChange("destination", dest)}
                  className={`py-3 px-4 rounded-xl border transition-all ${formData.destination === dest ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
                >
                  {dest}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or enter any destination manually</label>
              <input 
                type="text" 
                value={destinations.includes(formData.destination) ? '' : formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                placeholder="e.g. My Own Location"
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
              />
            </div>
          </div>
        );
      case 'travelers':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">How many people are traveling?</h2>
            <div className="flex items-center justify-center space-x-6 py-8">
              <button 
                onClick={() => handleChange('travelers', Math.max(1, formData.travelers - 1))}
                className="w-14 h-14 rounded-full bg-white/50 dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl hover:bg-white/70 transition-colors"
              >-</button>
              <div className="text-5xl font-display w-20 text-center">
                {formData.travelers}
              </div>
              <button 
                onClick={() => handleChange('travelers', formData.travelers + 1)}
                className="w-14 h-14 rounded-full bg-white/50 dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl hover:bg-white/70 transition-colors"
              >+</button>
            </div>
          </div>
        );
      case 'duration':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">How long is your trip?</h2>
            <div className="flex flex-col gap-3">
              {DURATIONS.map(dur => (
                <button
                  key={dur}
                  onClick={() => handleChange("duration", dur)}
                  className={`py-4 px-6 rounded-xl border flex items-center justify-between transition-all ${formData.duration === dur ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
                >
                  <span className="text-lg font-medium">{dur}</span>
                  <Calendar className={`w-5 h-5 ${formData.duration === dur ? 'text-blue-500' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Duration (in days)</label>
              <input 
                type="number" 
                value={DURATIONS.includes(formData.duration) ? '' : parseInt(formData.duration) || ''}
                onChange={(e) => handleChange("duration", e.target.value ? `${e.target.value} Days` : '')}
                placeholder="Enter number of days"
                min="1"
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
              />
            </div>
          </div>
        );
      case 'budget':
        const currentBudgets = formData.tripType === "International" ? INTERNATIONAL_BUDGETS : NATIONAL_BUDGETS;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">What's your budget per person?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentBudgets.map(bud => (
                <button
                  key={bud.label}
                  onClick={() => handleChange("budget", bud.label)}
                  className={`p-6 rounded-2xl border flex flex-col items-center gap-2 transition-all ${formData.budget === bud.label ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md text-blue-700 dark:text-blue-300' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
                >
                  <span className="text-xl font-medium">{bud.label}</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{bud.amount}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'with':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Who are you traveling with?</h2>
            <div className="grid grid-cols-2 gap-4">
              {TRAVEL_WITH.map(withWho => (
                <button
                  key={withWho}
                  onClick={() => handleChange("travelWith", withWho)}
                  className={`py-4 px-6 rounded-xl border transition-all ${formData.travelWith === withWho ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium tracking-wide shadow-sm' : 'border-white/20 dark:border-slate-700 bg-white/30 dark:bg-slate-800/40 hover:bg-white/50'}`}
                >
                  {withWho}
                </button>
              ))}
            </div>
          </div>
        );
      case 'interests':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">What are your main travel interests?</h2>
            <p className="text-gray-500 dark:text-gray-400">Select all that apply</p>
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleArrayItem("interests", interest)}
                  className={`py-2 px-4 rounded-full border transition-all ${formData.interests.includes(interest) ? 'border-blue-500 bg-blue-500 text-white shadow-md' : 'border-white/40 dark:border-slate-600 bg-white/40 dark:bg-slate-700 hover:bg-white/60'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );
      case 'problems':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Do you have any specific concerns or problems?</h2>
            <p className="text-gray-500 dark:text-gray-400">How can we help you better? (Select multiple)</p>
            <div className="flex flex-col gap-3">
              {PROBLEMS.map(problem => (
                <button
                  key={problem}
                  onClick={() => toggleArrayItem("problems", problem)}
                  className={`py-3 px-5 rounded-xl border text-left transition-all ${formData.problems.includes(problem) ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 shadow-sm' : 'border-white/30 dark:border-slate-700 bg-white/20 dark:bg-slate-800/20 hover:bg-white/40'}`}
                >
                  {problem}
                </button>
              ))}
            </div>
          </div>
        );
      case 'submit':
        return (
          <div className="space-y-6 text-center py-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">You're all set!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              We have everything we need. Click the button below to generate your personalized MyNextTrip itinerary.
            </p>
            <button
              onClick={() => onGenerate(formData)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center mx-auto gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {formData.wantsAiSuggestion === 'Yes' ? 'Generating AI Suggestions...' : 'Crafting Your Plan...'}
                </>
              ) : (
                "Generate MyNextTrip Plan"
              )}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-slate-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="text-sm font-medium text-blue-500 mb-8 uppercase tracking-wider">
          Step {step} of {totalSteps}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {currentStepKey !== 'submit' && (
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-slate-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
