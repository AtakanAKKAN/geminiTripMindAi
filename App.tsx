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
  const [view, setView] = useState<ViewState>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("İşlem Başlatılıyor...");
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tema Yönetimi
  useEffect(() => {
    // Kayıtlı temayı kontrol et
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  };

  const saveTripToStorage = (trip: Trip) => {
      const saved = localStorage.getItem('gezirota_trips');
      const trips: Trip[] = saved ? JSON.parse(saved) : [];
      
      const exists = trips.find(t => t.id === trip.id);
      if (!exists) {
          trips.unshift(trip);
          localStorage.setItem('gezirota_trips', JSON.stringify(trips));
      }
  };

  const handleCreateTrip = async (request: CreateTripRequest) => {
    setIsLoading(true);
    setLoadingStepText("Şehir verileri inceleniyor...");

    const timers: ReturnType<typeof setTimeout>[] = [];
    
    timers.push(setTimeout(() => setLoadingStepText("En popüler mekanlar listeleniyor..."), 3000));
    timers.push(setTimeout(() => setLoadingStepText("Kullanıcı yorumları ve puanlar analiz ediliyor..."), 6000));
    timers.push(setTimeout(() => setLoadingStepText("Konaklama ve ulaşım seçenekleri değerlendiriliyor..."), 10000));
    timers.push(setTimeout(() => setLoadingStepText("Rota mesafeye göre optimize ediliyor..."), 14000));
    timers.push(setTimeout(() => setLoadingStepText("Son dokunuşlar yapılıyor..."), 18000));
    
    try {
        const newTrip = await createTripWithGemini(request);

        setCurrentTrip(newTrip);
        saveTripToStorage(newTrip); 
        setView('ITINERARY');
    } catch (error: any) {
        console.error("Trip creation failed", error);
        
        let userMessage = error.message || "Bilinmeyen bir hata oluştu.";
        
        if (userMessage.includes("Redeploy")) {
            alert(`⚠️ KURULUM HATASI:\n\nAPI Anahtarını Vercel'e eklediniz ancak değişikliklerin geçerli olması için projeyi tekrar dağıtmanız (Redeploy) gerekiyor.\n\nVercel Panel > Deployments > Redeploy yolunu izleyin.`);
        } else {
            alert(`⚠️ HATA:\n\n${userMessage}`);
        }
    } finally {
        timers.forEach(clearTimeout);
        setIsLoading(false);
        setLoadingStepText(""); 
    }
  };

  const handleReset = () => {
      setCurrentTrip(null);
      setView('HOME');
  };

  const handleLoadTrip = (trip: Trip) => {
      setCurrentTrip(trip);
      setView('ITINERARY');
  }

  const handleSwapPlace = async (dayId: string, itemId: string) => {
     if (!currentTrip) return;

     const dayIndex = currentTrip.tripDays.findIndex(d => d.id === dayId);
     if (dayIndex === -1) return;
     const day = currentTrip.tripDays[dayIndex];
     
     const itemIndex = day.items.findIndex(i => i.id === itemId);
     if (itemIndex === -1) return;
     const itemToSwap = day.items[itemIndex];

     setSwappingItemId(itemId);

     try {
         const newPlace = await swapPlaceWithGemini(currentTrip.city, itemToSwap.place);
         
         const updatedTrip = { ...currentTrip };
         updatedTrip.tripDays = [...currentTrip.tripDays];
         updatedTrip.tripDays[dayIndex] = {
             ...day,
             items: [...day.items]
         };
         updatedTrip.tripDays[dayIndex].items[itemIndex] = {
             ...itemToSwap,
             id: `swapped_${Date.now()}`, 
             place: newPlace
         };
         
         setCurrentTrip(updatedTrip);
     } catch (error: any) {
         alert(`Mekan değiştirilemedi: ${error.message}`);
     } finally {
         setSwappingItemId(null);
     }
  };

  const handleRegenerateDay = (dayId: string) => {
     alert("Bu özellik yakında eklenecektir.");
  };

  if (view === 'ADMIN') {
      return <AdminView onBack={() => setView('HOME')} />;
  }

  if (view === 'ABOUT') {
    return <AboutView onBack={() => setView('HOME')} />;
  }

  if (view === 'SAVED') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <SavedTripsView onBack={() => setView('HOME')} onLoadTrip={handleLoadTrip} />
        </div>
      );
  }

  if (view === 'ITINERARY' && currentTrip) {
    return (
        <ItineraryView 
            trip={currentTrip} 
            onReset={handleReset}
            onSwapPlace={handleSwapPlace}
            onRegenerateDay={handleRegenerateDay}
            isSwappingItem={swappingItemId}
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans selection:bg-emerald-200 dark:selection:bg-emerald-800 transition-colors duration-300">
      
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200 dark:shadow-none">T</div>
             <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">TripMind AI</span>
           </div>
           
           <div className="flex items-center gap-4">
               {/* Dark Mode Toggle */}
               <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-all"
                  title={isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
               >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                  )}
               </button>

               <button onClick={() => setView('ABOUT')} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hidden sm:block transition-colors">
                   Hakkımızda
               </button>
               
               <button onClick={() => setView('SAVED')} className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap">
                   Gezilerim
               </button>
           </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center mb-12 max-w-2xl px-4 mt-8 sm:mt-0">
           <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-6 border border-emerald-100 dark:border-emerald-800 shadow-sm">
              ✨ Yapay Zeka Destekli Gezi Asistanı
           </span>
           <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
             Türkiye'yi Keşfet,<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Saniyeler İçinde Planla.</span>
           </h1>
           <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
             Şehrini seç, ilgi alanlarını belirle, yapay zeka senin için en iyi rotayı, en lezzetli restoranları ve gizli kalmış güzellikleri planlasın.
           </p>
        </div>

        <div className="w-full max-w-2xl pb-10">
           <TripForm 
                onSubmit={handleCreateTrip} 
                isLoading={isLoading} 
                loadingText={loadingStepText}
           />
        </div>

        <footer className="mt-auto py-6 text-gray-400 dark:text-gray-600 text-sm font-medium flex gap-4">
           <p>© {new Date().getFullYear()} TripMind AI.</p>
           <button onClick={() => setView('ABOUT')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors sm:hidden">Hakkımızda</button>
           <button onClick={() => setView('ADMIN')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors opacity-50 text-xs">Yönetici</button>
        </footer>
      </main>
    </div>
  );
};

export default App;