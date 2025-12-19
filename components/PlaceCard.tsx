import React from 'react';
import { DayItem, TransportType } from '../types';

interface PlaceCardProps {
  item: DayItem;
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
  transportType: TransportType;
  onSwap?: (itemId: string) => void;
  isSwapping?: boolean;
  isDining?: boolean; // Yeni özellik: Yemek kartı modu
}

const CATEGORY_STYLES: Record<string, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-900 border-orange-200',
  MUSEUM: 'bg-purple-100 text-purple-900 border-purple-200',
  PARK: 'bg-green-100 text-green-900 border-green-200',
  HISTORIC: 'bg-amber-100 text-amber-900 border-amber-200',
  SHOPPING: 'bg-blue-100 text-blue-900 border-blue-200',
  CAFE: 'bg-pink-100 text-pink-900 border-pink-200',
  HOTEL: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  DEFAULT: 'bg-emerald-100 text-emerald-900 border-emerald-200'
};

const translateCategory = (cat: string) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('RESTAURANT')) return 'RESTORAN & LEZZET';
    if (c.includes('MUSEUM')) return 'MÜZE';
    if (c.includes('PARK')) return 'PARK & DOĞA';
    if (c.includes('HISTORIC')) return 'TARİH';
    if (c.includes('SHOPPING')) return 'ALIŞVERİŞ';
    if (c.includes('CAFE')) return 'KAFE';
    if (c.includes('HOTEL')) return 'OTEL';
    return 'MEKAN';
};

const translateTimeSlot = (slot: string) => {
    const s = (slot || '').toLowerCase();
    if (s.includes('morning')) return 'SABAH';
    if (s.includes('lunch')) return 'ÖĞLE';
    if (s.includes('afternoon')) return 'ÖĞLEDEN SONRA';
    if (s.includes('dinner')) return 'AKŞAM';
    if (s.includes('evening')) return 'GECE';
    return 'GÜN İÇİ';
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ item, index, isFirst, isLast, transportType, onSwap, isSwapping, isDining = false }) => {
  const { place, timeSlot, startTime, durationMinutes } = item;
  const isCar = transportType === 'CAR';
  const catStyle = isDining ? CATEGORY_STYLES.RESTAURANT : (CATEGORY_STYLES[place.category] || CATEGORY_STYLES.DEFAULT);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.lat + ',' + place.lng)}`;

  return (
    // Padding küçültüldü: pl-10/12
    <div className={`relative pl-10 md:pl-12 pb-4 ${isDining ? 'mb-2' : 'pb-8 last:pb-2'} group`}>
      
      {/* Timeline Çizgisi - Sadece normal duraklarda göster */}
      {!isDining && !isLast && (
        <div className="absolute left-[15px] md:left-[19px] top-10 bottom-0 w-1 bg-emerald-100 group-hover:bg-emerald-300 transition-colors rounded-full"></div>
      )}
      
      {/* Numara Yuvarlağı veya İkon */}
      <div className={`absolute left-0 top-2 md:top-2 w-8 h-8 md:w-10 md:h-10 rounded-full border-[3px] border-white shadow-md z-10 flex items-center justify-center text-sm md:text-base font-black text-white transition-all transform 
        ${isDining ? 'bg-orange-500 scale-100' : (isFirst ? 'bg-emerald-600 scale-110' : 'bg-emerald-400')} 
        group-hover:scale-110 group-hover:bg-opacity-90`}>
        {isDining ? (
            // Yemek İkonu
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        ) : (
            // Numara
            index + 1
        )}
      </div>

      <div className={`
        rounded-2xl md:rounded-3xl p-4 border-2 transition-all shadow-sm hover:shadow-lg backdrop-blur-sm
        ${isDining ? 'bg-orange-50/60 border-orange-100 hover:border-orange-300' : 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300'}
      `}>
        {/* Üst Bilgi: Saat ve Kategori */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-black text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-sm">{startTime}</span>
            <span className={`text-[9px] md:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider border shadow-sm ${catStyle}`}>
              {translateCategory(isDining ? 'RESTAURANT' : place.category)}
            </span>
          </div>
          {onSwap && (
            <button onClick={() => onSwap(item.id)} disabled={isSwapping} className="bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm" title="Mekanı Değiştir">
                <svg className={`w-4 h-4 ${isSwapping ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          )}
        </div>

        {/* Başlık ve Açıklama */}
        <h3 className="font-extrabold text-gray-900 text-lg md:text-xl mb-2 tracking-tight leading-tight">{place.name}</h3>
        <p className="text-gray-700 text-xs md:text-sm mb-4 leading-relaxed font-medium">{place.description}</p>
        
        {/* Butonlar */}
        <div className="flex flex-wrap gap-2 mb-4">
           <a href={googleMapsUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-white px-3 py-2 rounded-xl shadow-md transition-all hover:-translate-y-0.5 ${isDining ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             HARİTA
           </a>
           {place.website && (
             <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-blue-700 bg-white border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-sm">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
               WEB SİTESİ
             </a>
           )}
        </div>

        {/* Alt Bilgi */}
        <div className={`flex items-center gap-3 pt-4 border-t border-dashed ${isDining ? 'border-orange-100' : 'border-emerald-100'}`}>
           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${isDining ? 'bg-orange-100 text-orange-900 border-orange-200' : 'bg-amber-100 text-amber-900 border-amber-200'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-[10px] md:text-xs font-black tracking-tight">{durationMinutes} DK ZİYARET</span>
           </div>
           
           <div className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border ${isDining ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                {translateTimeSlot(timeSlot)}
           </div>
        </div>

        {/* Ulaşım Notu */}
        <div className={`mt-3 relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border p-3 transition-colors ${isDining ? 'border-orange-100' : 'border-indigo-100'}`}>
            <div className="relative z-10 flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCar ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                    {isCar ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                </div>
                <div className="flex-1">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-900 mb-0.5">
                        {isCar ? 'OTOPARK BİLGİSİ' : 'EN YAKIN DURAK'}
                    </h5>
                    <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {place.transportInfo?.modeAdvice || 'Ulaşım bilgisi hazırlanıyor.'}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
