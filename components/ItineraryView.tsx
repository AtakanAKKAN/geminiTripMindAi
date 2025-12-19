import React, { useState, useEffect } from 'react';
import { Trip, TripDay, TransportType, PaceType } from '../types';
import { PlaceCard } from './PlaceCard';
import { MapComponent } from './MapComponent';
import { generateDaySummary } from '../services/geminiService';

interface ItineraryViewProps {
  trip: Trip;
  onReset: () => void;
  onSwapPlace: (dayId: string, itemId: string) => void;
  onRegenerateDay: (dayId: string) => void;
  isSwappingItem?: string | null;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onReset, onSwapPlace, onRegenerateDay, isSwappingItem }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [daySummaries, setDaySummaries] = useState<Record<number, string>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false); 
  const [showHotels, setShowHotels] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showDining, setShowDining] = useState(false);

  const currentDay: TripDay | undefined = trip.tripDays.find(d => d.dayNumber === activeDay);

  useEffect(() => {
    const fetchSummary = async () => {
      if (currentDay && !daySummaries[activeDay]) {
        setIsSummarizing(true);
        try {
            const summary = await generateDaySummary(trip.city, currentDay);
            setDaySummaries(prev => ({ ...prev, [activeDay]: summary }));
        } catch (e) {
            setDaySummaries(prev => ({ ...prev, [activeDay]: `Plan hazır.` }));
        } finally {
            setIsSummarizing(false);
        }
      }
    };
    fetchSummary();
  }, [activeDay, currentDay, trip.city]);

  const formatReviewCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const getTransportLabel = (t: TransportType) => {
      if (t === TransportType.CAR) return 'Araç ile';
      if (t === TransportType.PUBLIC_TRANSPORT) return 'Toplu Taşıma';
      return 'Yürüyerek';
  };

  const getPaceLabel = (p: PaceType) => {
      if (p === PaceType.RELAXED) return 'Sakin Tempo';
      if (p === PaceType.INTENSE) return 'Yoğun Tempo';
      return 'Orta Tempo';
  };

  const handleShare = () => {
     const hotelName = trip.hotelRecommendations[0]?.name || 'Belirtilmemiş';
     const text = `TripMind AI ile ${trip.city} için ${trip.days} günlük harika bir gezi planı oluşturdum! 🎒\n\n🏨 Önerilen Otel: ${hotelName}\n🚀 Tempo: ${getPaceLabel(trip.pace)}\n🚗 Ulaşım: ${getTransportLabel(trip.transport)}\n\nKeşfetmeye hazırım!`;
     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!currentDay) return null;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sol Panel: Liste */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-full border-r border-gray-100 bg-white">
        <div className="p-5 border-b border-gray-50 flex-shrink-0">
          <div className="flex justify-between items-start mb-3">
            <button onClick={onReset} className="text-xs text-gray-400 hover:text-emerald-600 transition-colors flex items-center font-bold">
                <span className="mr-1 text-base">←</span> Planlamayı Düzenle / Yeni Rota
            </button>
            
            <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-full transition-colors shadow-sm"
            >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                PAYLAŞ
            </button>
          </div>
          
          {/* Header - Sola ve Sağa Yaslı */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
             <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{trip.city}</h1>
             <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-1 rounded-lg shadow-sm">{trip.days} GÜN</span>
                <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-1 rounded-lg border border-orange-200">{getTransportLabel(trip.transport)}</span>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-1 rounded-lg border border-purple-200">{getPaceLabel(trip.pace)}</span>
             </div>
          </div>
        </div>

        {/* Gün Seçici */}
        <div className="flex overflow-x-auto px-5 py-3 bg-gray-50/80 border-b border-gray-100 no-scrollbar gap-2 flex-shrink-0 backdrop-blur-sm sticky top-0 z-20">
          {trip.tripDays.map(day => (
            <button 
              key={day.id} 
              onClick={() => setActiveDay(day.dayNumber)} 
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all transform duration-200 ${activeDay === day.dayNumber ? 'bg-emerald-600 text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}
            >
              {day.dayNumber}. Gün
            </button>
          ))}
        </div>

        {/* Scroll Alanı */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 no-scrollbar pb-32">
          
          {/* Gün Özeti */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 md:p-5 border border-emerald-100 relative overflow-hidden shadow-sm">
             <div className="absolute -right-6 -top-6 text-emerald-100/60 rotate-12">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
             </div>
             <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="bg-emerald-200 p-1 rounded-md">
                    <svg className="w-3.5 h-3.5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">GÜNÜN ÖZETİ</h4>
             </div>
            {isSummarizing ? <div className="animate-pulse h-3 bg-emerald-200/50 rounded w-3/4"></div> : <p className="text-gray-700 text-xs md:text-sm font-medium leading-relaxed relative z-10">{daySummaries[activeDay]}</p>}
          </div>

          {/* Konaklama Kutusu */}
          {trip.hotelRecommendations && trip.hotelRecommendations.length > 0 && (
            <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700 shadow-sm">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </span>
                        Konaklama Tavsiyeleri
                    </h3>
                    <button 
                        onClick={() => setShowHotels(!showHotels)} 
                        className="text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                        {showHotels ? 'GİZLE' : 'GÖSTER'}
                    </button>
                </div>
                
                {showHotels && (
                    <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                        {trip.hotelRecommendations.map((hotel, idx) => (
                            <div key={hotel.id || idx} className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <h4 className="font-bold text-indigo-900 text-sm leading-tight">{hotel.name}</h4>
                                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 self-start">
                                        <span className="text-amber-500 font-bold text-xs">★ {hotel.rating}</span>
                                        <span className="text-gray-400 text-[10px] font-medium">({formatReviewCount(hotel.reviewCount)})</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    {hotel.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                     <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + trip.city)}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="w-auto flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        HARİTA
                                    </a>
                                    {hotel.website && (
                                        <a 
                                            href={hotel.website} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="w-auto flex items-center justify-center gap-1.5 bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-50 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                            WEB SİTESİ
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {/* Şehir İçi Ulaşım Bilgisi Kartı */}
          {trip.cityTransport && trip.transport !== TransportType.CAR && (
             <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 relative overflow-hidden group">
                <div className="flex items-center justify-between relative z-20">
                    <h3 className="text-sm md:text-base font-bold text-cyan-900 flex items-center gap-2">
                        <span className="bg-cyan-100 p-1.5 rounded-lg text-cyan-700 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </span>
                        Şehir Ulaşım Rehberi
                    </h3>
                    <button 
                        onClick={() => setShowTransport(!showTransport)} 
                        className="text-[10px] font-bold text-cyan-700 bg-cyan-100 hover:bg-cyan-200 border border-cyan-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                        {showTransport ? 'GİZLE' : 'GÖSTER'}
                    </button>
                </div>
                
                {showTransport && (
                    <div className="relative z-10 mt-3 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-medium text-cyan-800 mb-3 leading-relaxed bg-white/60 p-3 rounded-xl border border-cyan-100 backdrop-blur-sm">
                            {trip.cityTransport.generalAdvice}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {trip.cityTransport.cardName && (
                                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-cyan-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-cyan-500 uppercase">ŞEHİR KARTI</div>
                                        <div className="text-xs font-bold text-gray-800">{trip.cityTransport.cardName}</div>
                                    </div>
                                </div>
                            )}
                            {trip.cityTransport.appName && (
                                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-cyan-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-cyan-500 uppercase">MOBİL UYGULAMA</div>
                                        <div className="text-xs font-bold text-gray-800">{trip.cityTransport.appName}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
             </div>
          )}

          {/* Mekan Listesi (Sadece Gezi Noktaları) */}
          <div className="space-y-0">
            {currentDay.items.map((item, index) => (
              <PlaceCard 
                key={item.id} 
                item={item} 
                index={index}
                isFirst={index === 0} 
                isLast={index === currentDay.items.length - 1} 
                transportType={trip.transport} 
                isSwapping={isSwappingItem === item.id} 
                onSwap={(itemId) => onSwapPlace(currentDay.id, itemId)} 
              />
            ))}
          </div>

          {/* Günün Lezzet Durakları (Açılır/Kapanır) */}
          {currentDay.diningRecommendations && currentDay.diningRecommendations.length > 0 && (
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-orange-100 p-1.5 rounded-lg text-orange-700 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </span>
                        Günün Lezzet Durakları
                    </h3>
                    <button 
                        onClick={() => setShowDining(!showDining)} 
                        className="text-[10px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 border border-orange-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                        {showDining ? 'GİZLE' : 'GÖSTER'}
                    </button>
                </div>
                
                {showDining && (
                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                        {currentDay.diningRecommendations.map((item) => (
                             <PlaceCard 
                                key={item.id} 
                                item={item} 
                                index={-1} // Index kullanılmıyor
                                isFirst={false} 
                                isLast={false} 
                                transportType={trip.transport}
                                isDining={true} // Yemek modu aktif
                            />
                        ))}
                    </div>
                )}
            </div>
          )}

        </div>
      </div>

      {/* Sağ Panel: Harita */}
      <div className="hidden md:flex flex-1 relative bg-gray-100">
        <MapComponent 
            items={currentDay.items} 
            hotels={showHotels ? trip.hotelRecommendations : undefined} 
            dining={showDining && currentDay.diningRecommendations ? currentDay.diningRecommendations : undefined}
        />
      </div>

      {/* Mobil Harita Modalı */}
      {showMobileMap && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
             <div className="p-3 border-b flex justify-between items-center bg-white shadow-sm z-10 relative">
              <h3 className="font-bold text-gray-900 text-lg">Harita Görünümü</h3>
              <button onClick={() => setShowMobileMap(false)} className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200 ml-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="bg-white border-b border-gray-100 p-2">
                 <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                    {trip.tripDays.map(day => (
                        <button 
                        key={day.id} 
                        onClick={() => setActiveDay(day.dayNumber)} 
                        className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-lg border transition-all ${activeDay === day.dayNumber ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                        {day.dayNumber}. Gün
                        </button>
                    ))}
                 </div>
            </div>
            
            <div className="flex-1 relative">
              <MapComponent 
                items={currentDay.items} 
                hotels={showHotels ? trip.hotelRecommendations : undefined}
                dining={showDining && currentDay.diningRecommendations ? currentDay.diningRecommendations : undefined}
              />
              
              {/* Floating Toggle Butonları - Sağ Orta Taraf (Geliştirilmiş Yerleşim) */}
              <div className="absolute top-24 right-6 z-[1000] flex flex-col gap-6">
                 {/* Otel Toggle */}
                 <button 
                    onClick={() => setShowHotels(!showHotels)} 
                    className={`w-12 h-12 flex items-center justify-center rounded-full border shadow-xl transition-all transform active:scale-90 ${showHotels ? 'bg-indigo-600 text-white border-indigo-700 scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    aria-label="Otelleri Göster/Gizle"
                 >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3H11v8H5V7H3v14h2v-3h14v3h2V10c0-2.21-1.79-4-4-4z"/></svg>
                 </button>

                 {/* Yemek Toggle */}
                 <button 
                    onClick={() => setShowDining(!showDining)} 
                    className={`w-12 h-12 flex items-center justify-center rounded-full border shadow-xl transition-all transform active:scale-90 ${showDining ? 'bg-orange-500 text-white border-orange-600 scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    aria-label="Yemek Yerlerini Göster/Gizle"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                 </button>
              </div>
            </div>
        </div>
      )}
      
      {/* Mobil Harita Butonu */}
      <button onClick={() => setShowMobileMap(true)} className="md:hidden fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-xl shadow-emerald-700/40 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
      </button>

    </div>
  );
};