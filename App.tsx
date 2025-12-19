import React, { useState } from 'react';
import { CreateTripRequest, Trip } from './types';
import { TripForm } from './components/TripForm';
import { ItineraryView } from './components/ItineraryView';
import { SavedTripsView } from './components/SavedTripsView';
import { AboutView } from './components/AboutView';
import { FeedbackModal } from './components/FeedbackModal';
import { createTripWithGemini, swapPlaceWithGemini } from './services/geminiService';

type ViewState = 'HOME' | 'ITINERARY' | 'SAVED' | 'ABOUT';

const App: React.FC = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("İşlem Başlatılıyor...");
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

    // Simulate progress steps to keep user engaged while waiting for AI
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
        
        // Hata mesajı özelleştirme
        if (userMessage.includes("Redeploy")) {
            alert(`⚠️ KURULUM HATASI:\n\nAPI Anahtarını Vercel'e eklediniz ancak değişikliklerin geçerli olması için projeyi tekrar dağıtmanız (Redeploy) gerekiyor.\n\nVercel Panel > Deployments > Redeploy yolunu izleyin.`);
        } else {
            alert(`⚠️ HATA:\n\n${userMessage}`);
        }
    } finally {
        // Clear all timers to avoid state updates after unmount/finish
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
         
         // Create new trip state immutably
         const updatedTrip = { ...currentTrip };
         updatedTrip.tripDays = [...currentTrip.tripDays];
         updatedTrip.tripDays[dayIndex] = {
             ...day,
             items: [...day.items]
         };
         // Update the item's place
         updatedTrip.tripDays[dayIndex].items[itemIndex] = {
             ...itemToSwap,
             id: `swapped_${Date.now()}`, // Force re-render key
             place: newPlace
         };
         
         setCurrentTrip(updatedTrip);
         // Optional: Update local storage if auto-save is desired
     } catch (error: any) {
         alert(`Mekan değiştirilemedi: ${error.message}`);
     } finally {
         setSwappingItemId(null);
     }
  };

  const handleRegenerateDay = (dayId: string) => {
     alert("Bu özellik şu an sadece demo modunda çalışmaktadır. AI ile üretilen rotalarda gün yenileme yakında eklenecektir.");
  };

  if (view === 'ABOUT') {
    return <AboutView onBack={() => setView('HOME')} />;
  }

  if (view === 'SAVED') {
      return (
        <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-200">
      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">T</div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">TripMind AI</span>
           </div>
           
           <div className="flex items-center gap-4">
               <button onClick={() => setView('ABOUT')} className="text-sm font-medium text-gray-500 hover:text-emerald-600 hidden sm:block transition-colors">
                   Hakkımızda
               </button>
               <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-gray-500 hover:text-emerald-600 transition-colors"
                  aria-label="Geri Bildirim"
                  title="Geri Bildirim Gönder"
               >
                   <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                   <span className="hidden sm:inline text-sm font-medium">Geri Bildirim</span>
               </button>
               <button onClick={() => setView('SAVED')} className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap">
                   Gezilerim
               </button>
           </div>
        </div>
      </nav>

      {/* Hero / Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center mb-12 max-w-2xl px-4 mt-8 sm:mt-0">
           <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6 border border-emerald-100 shadow-sm">
              ✨ Yapay Zeka Destekli Gezi Asistanı
           </span>
           <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
             Türkiye'yi Keşfet,<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Saniyeler İçinde Planla.</span>
           </h1>
           <p className="text-lg text-gray-600 leading-relaxed">
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

        <footer className="mt-auto py-6 text-gray-400 text-sm font-medium flex gap-4">
           <p>© {new Date().getFullYear()} TripMind AI.</p>
           <button onClick={() => setView('ABOUT')} className="hover:text-emerald-600 transition-colors sm:hidden">Hakkımızda</button>
        </footer>
      </main>
    </div>
  );
};

export default App;