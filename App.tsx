import React, { useState, useEffect } from 'react';
import { CreateTripRequest, Trip } from './types';
import { TripForm } from './components/TripForm';
import { ItineraryView } from './components/ItineraryView';
import { SavedTripsView } from './components/SavedTripsView';
import { AboutView } from './components/AboutView';
import { AdminView } from './components/AdminView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { SafeImage } from './components/SafeImage';
import { createTripWithGemini, swapPlaceWithGemini } from './services/geminiService';

type ViewState = 'HOME' | 'ITINERARY' | 'SAVED' | 'ABOUT' | 'ADMIN' | 'PRIVACY';

const App: React.FC = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("İşlem Başlatılıyor...");
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const savedCooldown = localStorage.getItem('tripmind_cooldown_end');
    if (savedCooldown) {
      const endTime = parseInt(savedCooldown, 10);
      const now = Date.now();
      if (endTime > now) setCooldownRemaining(Math.ceil((endTime - now) / 1000));
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            localStorage.removeItem('tripmind_cooldown_end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleCreateTrip = async (request: CreateTripRequest) => {
    if (isOffline) return alert("Bağlantı yok.");
    if (cooldownRemaining > 0) return alert(`Lütfen bekleyin. Kalan süre: ${cooldownRemaining} saniye.`);
    setIsLoading(true);
    setLoadingStepText("Şehir analizi ve paralel planlama başlatıldı...");
    try {
      const finalTrip = await createTripWithGemini(request, () => {
          setLoadingStepText("Oteller bulundu, günler planlanıyor...");
      });
      setCurrentTrip(finalTrip);
      const saved = localStorage.getItem('gezirota_trips');
      const trips: Trip[] = saved ? JSON.parse(saved) : [];
      if (!trips.find(t => t.id === finalTrip.id)) {
        trips.unshift(finalTrip);
        localStorage.setItem('gezirota_trips', JSON.stringify(trips));
      }
      localStorage.setItem('tripmind_cooldown_end', (Date.now() + 5 * 60 * 1000).toString());
      setCooldownRemaining(300);
      setView('ITINERARY');
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingStepText("");
    }
  };

  const renderView = () => {
    switch (view) {
      case 'ADMIN': return <AdminView onBack={() => setView('HOME')} />;
      case 'ABOUT': return <AboutView onBack={() => setView('HOME')} />;
      case 'PRIVACY': return <PrivacyPolicyView onBack={() => setView('HOME')} />;
      case 'SAVED': return <SavedTripsView onBack={() => setView('HOME')} onLoadTrip={(t) => { setCurrentTrip(t); setView('ITINERARY'); }} />;
      case 'ITINERARY': 
        return currentTrip ? (
          <ItineraryView 
            trip={currentTrip} 
            onReset={() => { setCurrentTrip(null); setView('HOME'); }} 
            onSwapPlace={async (dayId, itemId) => {
              if (!currentTrip || isOffline) return;
              setSwappingItemId(itemId);
              try {
                const dayIndex = currentTrip.tripDays.findIndex(d => d.id === dayId);
                const itemIndex = currentTrip.tripDays[dayIndex].items.findIndex(i => i.id === itemId);
                const newPlace = await swapPlaceWithGemini(currentTrip.city, currentTrip.tripDays[dayIndex].items[itemIndex].place);
                const updatedTrip = { ...currentTrip };
                updatedTrip.tripDays[dayIndex].items[itemIndex].place = newPlace;
                setCurrentTrip(updatedTrip);
              } catch (e: any) { alert(e.message); } finally { setSwappingItemId(null); }
            }} 
            onRegenerateDay={() => {}} 
            isSwappingItem={swappingItemId} 
          />
        ) : <TripForm onSubmit={handleCreateTrip} isLoading={isLoading} loadingText={loadingStepText} isOffline={isOffline} cooldownSeconds={cooldownRemaining} />;
      default:
        return (
          <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="text-center mb-12 max-w-2xl mt-8">
              <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Türkiye'yi Keşfet,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Işık Hızında Planla.</span></h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">Yapay zeka ile kişiselleştirilmiş kusursuz gezi rotaları.</p>
            </div>
            <div className="w-full max-w-2xl pb-10">
              <TripForm onSubmit={handleCreateTrip} isLoading={isLoading} loadingText={loadingStepText} isOffline={isOffline} cooldownSeconds={cooldownRemaining} />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        {isOffline && <div className="bg-red-500 text-white text-[10px] font-black text-center py-1 absolute w-full top-full left-0 uppercase tracking-widest">Çevrimdışı Mod: Kayıtlı Gezilere Bakabilirsiniz</div>}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
            <SafeImage 
              src="icon-192.png" 
              alt="Logo" 
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-sm" 
              fallbackContent={
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">T</div>
              }
            />
            <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tighter">TripMind<span className="text-emerald-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-4 border-r pr-4 border-gray-200 dark:border-slate-700">
               <button onClick={() => setView('ABOUT')} className="text-xs font-bold text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors uppercase tracking-tight">Hakkımızda</button>
               <button onClick={() => setView('PRIVACY')} className="text-xs font-bold text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors uppercase tracking-tight">Gizlilik</button>
            </div>
            
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-lg">
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setView('SAVED')} className="text-[10px] md:text-xs font-black text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 dark:shadow-none uppercase tracking-wide">Gezilerim</button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {renderView()}
      </div>

      <footer className="py-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
                <p className="text-gray-400 text-xs font-bold">© {new Date().getFullYear()} TripMind AI. Tüm Hakları Saklıdır.</p>
                <div className="flex gap-4">
                    <button onClick={() => setView('ABOUT')} className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 uppercase">Hakkımızda</button>
                    <button onClick={() => setView('PRIVACY')} className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 uppercase">Gizlilik Politikası</button>
                    <button onClick={() => setView('ADMIN')} className="text-[10px] font-bold text-gray-300 hover:text-gray-500 uppercase">Yönetici</button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Powered By</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Google Gemini 2.0</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;