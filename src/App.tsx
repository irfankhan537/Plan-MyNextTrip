/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import TravelPlanner from './components/TravelPlanner';
import ResultSection from './components/ResultSection';
import { generateTravelPlan, getMockSuggestions } from './lib/gemini';
import { TravelFormData, TravelPlanResult } from './types';
import { Moon, Sun, MapPin, Plane } from 'lucide-react';

// Custom Modern Logo imitating the described branding using scalable, perfectly rendering icons
const ModernLogo = () => (
  <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 dark:bg-slate-800 rounded-full shadow-md border border-blue-100 dark:border-slate-700 shrink-0 mx-2">
    {/* Orbital dashed path */}
    <div className="absolute w-[80%] h-[80%] border-[2.5px] border-dashed border-blue-400 dark:border-blue-500 rounded-full" />
    
    {/* Solid inner Map Pin */}
    <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400 z-10 drop-shadow-sm mt-1" fill="currentColor" strokeWidth={1} />
    
    {/* Orange Airplane taking off */}
    <div className="absolute -right-2 -top-1 sm:-right-3 sm:-top-2 z-20">
      <Plane className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 drop-shadow-md transform rotate-[45deg]" fill="currentColor" strokeWidth={1.5} stroke="white" />
    </div>
  </div>
);

export default function App() {
  const [result, setResult] = useState<TravelPlanResult | null>(null);
  const [formData, setFormData] = useState<TravelFormData | null>(null);
  const [suggestions, setSuggestions] = useState<{name: string, reason: string}[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleGenerate = async (data: TravelFormData) => {
    setFormData(data);
    if (data.wantsAiSuggestion === 'Yes' && !data.destination) {
      setIsLoading(true);
      setTimeout(() => {
        setSuggestions(getMockSuggestions(data.travelMonth, data.tripType, data.budget));
        setIsLoading(false);
      }, 1800); // 1.8 second delay to simulate AI processing
      return; 
    }
    await doGenerateTravelPlan(data);
  };

  const handleDestinationSelect = async (dest: string) => {
    if (!formData) return;
    const newData = { ...formData, destination: dest };
    setFormData(newData);
    await doGenerateTravelPlan(newData);
  };

  const doGenerateTravelPlan = async (data: TravelFormData) => {
    setIsLoading(true);
    try {
      const plan = await generateTravelPlan(data);
      setResult(plan);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while generating the plan. Please check your Gemini API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSuggestions(null);
    setFormData(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <ModernLogo />
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Plan MyNextTrip</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-full glass-panel hover:bg-white/20 dark:hover:bg-slate-700/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </header>

        <main>
          {(!result && !suggestions) ? (
            <TravelPlanner onGenerate={handleGenerate} isLoading={isLoading} />
          ) : (
            <ResultSection 
              result={result} 
              suggestions={suggestions}
              formData={formData}
              onSelectDestination={handleDestinationSelect}
              isLoading={isLoading}
              onReset={handleReset} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
