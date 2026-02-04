import React, { useState, useEffect } from 'react';
import { CreateTripRequest, Trip } from './types';
import { TripForm } from './components/TripForm';
import { ItineraryView } from './components/ItineraryView';
import { SavedTripsView } from './components/SavedTripsView';
import { AboutView } from './components/AboutView';
import { AdminView } from './components/AdminView';
import { createTripWithGemini, swapPlaceWithGemini } from './services/geminiService';

type ViewState = 'HOME' | 'ITINERARY' | 'SAVED' | 'ABOUT' | 'ADMIN';

const App: React.FC = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [view, setView] = useState('HOME') as any;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("İşlem Başlatılıyor...");
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Göreceli yol kullanımı
  const LOGO_PATH = "icon-192.png";

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

  if (view === 'ADMIN') return <AdminView onBack={() => setView('HOME')} />;
  if (view === 'ABOUT') return <AboutView onBack={() => setView('HOME')} />;
  if (view === 'SAVED') return <SavedTripsView onBack={() => setView('HOME')} onLoadTrip={(t) => { setCurrentTrip(t); setView('ITINERARY'); }} />;
  if (view === 'ITINERARY' && currentTrip) return <ItineraryView trip={currentTrip} onReset={() => { setCurrentTrip(null); setView('HOME'); }} onSwapPlace={async (dayId, itemId) => {
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
  }} onRegenerateDay={() => {}} isSwappingItem={swappingItemId} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        {isOffline && <div className="bg-red-500 text-white text-xs font-bold text-center py-1 absolute w-full top-full left-0">Çevrimdışı Mod</div>}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
            {!logoError ? (
              <img src={LOGO_PATH} alt="Logo" className="w-10 h-10 rounded-xl" onError={() => setLogoError(true)} />
            ) : (
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">T</div>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-white">TripMind AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400">
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setView('SAVED')} className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg">Gezilerim</button>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="text-center mb-12 max-w-2xl mt-8">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Türkiye'yi Keşfet,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Işık Hızında Planla.</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Paralel işleme teknolojisiyle saniyeler içinde size özel rotalar oluşturuyoruz.</p>
        </div>
        <div className="w-full max-w-2xl pb-10">
          <TripForm onSubmit={handleCreateTrip} isLoading={isLoading} loadingText={loadingStepText} isOffline={isOffline} cooldownSeconds={cooldownRemaining} />
        </div>
        <footer className="mt-auto py-6 text-gray-400 text-sm flex gap-4">
          <p>© {new Date().getFullYear()} TripMind AI.</p>
          <button onClick={() => setView('ADMIN')} className="opacity-50">Yönetici</button>
        </footer>
      </main>
    </div>
  );
};

export default App;