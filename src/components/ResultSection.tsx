import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Plane, Train, Bus, Wallet, Hotel, Coffee, Calendar, ShieldCheck, ArrowRight, RotateCcw, Link as LinkIcon, Compass, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { TravelPlanResult, TravelFormData } from '../types';

interface ResultSectionProps {
  result: TravelPlanResult | null;
  suggestions: {name: string, reason: string}[] | null;
  formData: TravelFormData | null;
  onSelectDestination: (dest: string) => void;
  isLoading: boolean;
  onReset: () => void;
}

const DestinationImage = ({ placeName }: { placeName: string }) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(placeName)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=800&origin=*`);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].thumbnail) {
            if (active) setImageUrl(pages[pageId].thumbnail.source);
            return;
          }
        }
        if (active) setImageUrl(`https://picsum.photos/seed/${encodeURIComponent(placeName)}/600/400?blur=2`);
      } catch (err) {
         if (active) setImageUrl(`https://picsum.photos/seed/${encodeURIComponent(placeName)}/600/400?blur=2`);
      }
    };
    fetchImage();
    return () => { active = false; };
  }, [placeName]);

  return (
    <div className="w-full h-40 md:h-48 bg-slate-200 dark:bg-slate-700 relative shrink-0">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={placeName} 
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
           <svg className="w-8 h-8 animate-pulse opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
        </div>
      )}
    </div>
  );
};

export default function ResultSection({ result, suggestions, formData, onSelectDestination, isLoading, onReset }: ResultSectionProps) {
  
  const getTransportIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('flight') || t.includes('air')) return <Plane className="w-5 h-5 text-blue-500" />;
    if (t.includes('train') || t.includes('rail')) return <Train className="w-5 h-5 text-orange-500" />;
    return <Bus className="w-5 h-5 text-emerald-500" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const isSelecting = suggestions && suggestions.length > 0 && !result;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 pb-20">
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold">Your MyNextTrip Plan</h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-white/30 dark:bg-slate-800/50 hover:bg-white/50 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Start Over
        </button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

        {/* Route Preview ALWAYS shown (with partial data during selection) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className={`${isSelecting ? 'md:col-span-3' : 'md:col-span-2'} glass-panel p-6 flex flex-col justify-center transition-all`}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Route
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-4 sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">From</p>
                <p className="text-xl md:text-2xl font-display font-semibold">{result?.route.from || formData?.currentLocation}</p>
              </div>
              <div className="flex gap-2 text-gray-400 px-4 rotate-90 sm:rotate-0">
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">To</p>
                {(!isSelecting && suggestions && suggestions.length > 0) ? (
                  <div className="relative inline-flex items-center">
                    <select
                      value={formData?.destination || ''}
                      onChange={(e) => onSelectDestination(e.target.value)}
                      disabled={isLoading}
                      className="appearance-none pr-8 text-xl md:text-2xl font-display font-semibold text-blue-600 dark:text-blue-400 bg-transparent border-b-2 border-blue-500/30 focus:outline-none focus:border-blue-500 pb-1 cursor-pointer disabled:opacity-50"
                    >
                      {suggestions.map(s => (
                        <option key={s.name} value={s.name} className="text-base font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                  </div>
                ) : (
                  <p className={`text-xl md:text-2xl font-display font-semibold ${!formData?.destination ? 'text-gray-400 italic' : 'text-blue-600 dark:text-blue-400'}`}>
                    {result?.route.to || formData?.destination || "Select a destination below..."}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {!isSelecting && result && (
            <motion.div variants={itemVariants} className="glass-panel p-6 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 dark:from-blue-900/20 dark:to-emerald-900/20 text-center flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex justify-center items-center gap-2">
                <Wallet className="w-4 h-4" /> Est. Cost
              </h3>
              <p className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-1">₹{result.totalEstimatedCost.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total for all travelers</p>
              <div className="mt-3 inline-block px-3 py-1 bg-white/40 dark:bg-black/20 rounded-full text-xs font-medium">
                ₹{result.costPerPerson.toLocaleString()} per person
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Recommendations Phase */}
        {isSelecting && suggestions && (
          <motion.div variants={itemVariants} className="glass-panel p-6 border-blue-200 dark:border-blue-800/50 shadow-md">
            <h3 className="text-xl md:text-2xl font-display font-semibold flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-blue-500" /> Recommended Places for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((place, i) => (
                <button 
                  key={i} 
                  onClick={() => onSelectDestination(place.name)}
                  disabled={isLoading}
                  className={`flex flex-col rounded-2xl border text-left overflow-hidden transition-all ${
                    formData?.destination === place.name 
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 shadow-md ring-2 ring-blue-500/50 transform scale-[1.02]' 
                      : 'border-white/40 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 shadow-sm hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <DestinationImage placeName={place.name} />
                  <div className="p-5 flex-1 w-full flex flex-col">
                    <span className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0"/> {place.name}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{place.reason}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading Overlay when generating full plan */}
        {isLoading && (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 glass-panel text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-semibold">Crafting your detailed itinerary...</h3>
            <p className="text-gray-500 mt-2">Checking hotels, routes, and activities for {formData?.destination}.</p>
          </motion.div>
        )}

        {/* FULL RESULT DETAILS */}
        {!isLoading && result && (
          <>
            {/* Travel Options */}
            <motion.div variants={itemVariants} className="glass-panel p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-blue-500" /> Transport Options
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {result.travelOptions.map((opt, i) => (
                  <div key={i} className="border border-white/20 dark:border-slate-700 bg-white/20 dark:bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-medium">
                        {getTransportIcon(opt.type)} {opt.type}
                      </div>
                      <span className="text-sm font-semibold">₹{opt.estimatedCost.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{opt.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Accommodations & Food */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="glass-panel p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Hotel className="w-5 h-5 text-rose-500" /> Hotel Suggestions
                </h3>
                <div className="space-y-4">
                  {result.hotelSuggestions.map((hotel, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-white/10 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-800 dark:text-gray-100">{hotel.name}</h4>
                        <span className="text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded whitespace-nowrap">₹{hotel.pricePerNight}/night</span>
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{hotel.type}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hotel.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Coffee className="w-5 h-5 text-amber-500" /> Food Recommendations
                </h3>
                <div className="space-y-4">
                  {result.foodRecommendations.map((food, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-white/10 last:border-0 pb-3 last:pb-0">
                      <h4 className="font-medium text-slate-800 dark:text-gray-100">{food.name}</h4>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{food.type}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{food.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Day-wise Itinerary */}
            <motion.div variants={itemVariants} className="glass-panel p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-purple-500" /> Day-Wise Itinerary
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:to-transparent">
                {result.dayWisePlan.map((day, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                      {day.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/20 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 shadow">
                      <h4 className="font-semibold mb-2">{day.title}</h4>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {day.activities.map((act, j) => (
                          <li key={j}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Safety Tips */}
            <motion.div variants={itemVariants} className="glass-panel p-6 bg-red-50/30 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                <ShieldCheck className="w-5 h-5" /> Safety & Problem Solvers
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-disc pl-5">
                {result.safetyTips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{tip}</li>
                ))}
              </ul>
            </motion.div>

            {/* Booking Links Section */}
            <motion.div variants={itemVariants} className="glass-panel p-6 text-center pt-8">
              <h3 className="text-xl font-display font-semibold mb-6">Ready to Book?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <a href={`https://www.makemytrip.com/hotels/hotel-listing/?city=${result.route.to}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-transform hover:-translate-y-1">
                  Find Hotels <LinkIcon className="w-4 h-4" />
                </a>
                <a href={`https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(result.route.from)}+to+${encodeURIComponent(result.route.to)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-slate-800 dark:bg-white hover:bg-slate-700 dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-full font-medium transition-transform hover:-translate-y-1">
                  Find Flights <Plane className="w-4 h-4" />
                </a>
                <a href="https://www.irctc.co.in/nget/train-search" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium transition-transform hover:-translate-y-1">
                  Book Trains <Train className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </>
        )}

      </motion.div>
    </div>
  );
}
