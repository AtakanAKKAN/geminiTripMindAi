import React, { useState } from 'react';
import { CreateTripRequest, TransportType, PaceType, BudgetType } from '../types';
import { Button } from './Button';

interface TripFormProps {
  onSubmit: (data: CreateTripRequest) => void;
  isLoading: boolean;
  loadingText?: string; 
}

const POPULAR_CITIES = [
  "İstanbul",
  "Antalya", 
  "İzmir",
  "Ankara",
  "Nevşehir (Kapadokya)",
  "Muğla (Bodrum)",
  "Muğla (Fethiye)",
  "Muğla (Marmaris)",
  "Bursa",
  "Çanakkale",
  "Trabzon",
  "Gaziantep",
  "Şanlıurfa",
  "Mardin",
  "Eskişehir"
];

const CITY_SPECIFIC_LOCATIONS: Record<string, string[]> = {
  "İstanbul": [
    "Taksim Meydanı (Şehir Merkezi)",
    "Sultanahmet Meydanı",
    "İstanbul Havalimanı (IST)",
    "Sabiha Gökçen Havalimanı (SAW)",
    "Esenler Otogarı",
    "Alibeyköy Otogarı",
    "Harem Otogarı",
    "Kadıköy Rıhtım",
    "Söğütlüçeşme YHT Garı",
    "Halkalı Tren İstasyonu",
    "Yenikapı İDO İskelesi"
  ],
  "Antalya": [
    "Kaleiçi (Şehir Merkezi)",
    "Cumhuriyet Meydanı",
    "Antalya Havalimanı (AYT)",
    "Antalya Şehirlerarası Otogarı",
    "Konyaaltı Kent Meydanı"
  ],
  "İzmir": [
    "Alsancak (Şehir Merkezi)",
    "Konak Meydanı",
    "Adnan Menderes Havalimanı (ADB)",
    "İzmir Otogarı (İZOTAŞ)",
    "Basmane Tren Garı",
    "Fahrettin Altay Aktarma Merkezi"
  ],
  "Ankara": [
    "Kızılay Meydanı (Şehir Merkezi)",
    "Ulus Meydanı",
    "Esenboğa Havalimanı (ESB)",
    "AŞTİ (Otogar)",
    "Ankara YHT Garı"
  ],
  "Nevşehir (Kapadokya)": [
    "Uçhisar Meydanı (Şehir Merkezi)",
    "Nevşehir Kapadokya Havalimanı (NAV)",
    "Kayseri Erkilet Havalimanı (ASR)",
    "Nevşehir Otogarı",
    "Göreme Otogarı",
    "Ürgüp Otogarı"
  ],
  "Muğla (Bodrum)": [
    "Bodrum Kalesi (Şehir Merkezi)",
    "Bodrum Limanı",
    "Milas-Bodrum Havalimanı (BJV)",
    "Bodrum Otogarı"
  ],
  "Muğla (Fethiye)": [
    "Fethiye Kordon (Şehir Merkezi)",
    "Ölüdeniz Meydanı",
    "Dalaman Havalimanı (DLM)",
    "Fethiye Otogarı"
  ],
  "Muğla (Marmaris)": [
    "Atatürk Meydanı (Şehir Merkezi)",
    "Marmaris Limanı",
    "Dalaman Havalimanı (DLM)",
    "Marmaris Otogarı"
  ],
  "Bursa": [
    "15 Temmuz Demokrasi Meydanı (Şehir Merkezi)",
    "Heykel (Ulu Cami Yanı)",
    "Bursa Yenişehir Havalimanı (YEI)",
    "Bursa Otogarı (BURULAŞ)",
    "BUDO Mudanya İskelesi",
    "İDO Güzelyalı İskelesi"
  ],
  "Çanakkale": [
    "İskele Meydanı (Şehir Merkezi)",
    "Kilitbahir Feribot İskelesi",
    "Çanakkale Havalimanı (CKZ)",
    "Çanakkale Otogarı"
  ],
  "Trabzon": [
    "Meydan Parkı (Şehir Merkezi)",
    "Trabzon Limanı",
    "Trabzon Havalimanı (TZX)",
    "Trabzon Otogarı"
  ],
  "Gaziantep": [
    "15 Temmuz Demokrasi Meydanı (Şehir Merkezi)",
    "Gaziantep Garı",
    "Gaziantep Havalimanı (GZT)",
    "Gaziantep Otogarı"
  ],
  "Şanlıurfa": [
    "Balıklıgöl (Şehir Merkezi)",
    "Topçu Meydanı",
    "Şanlıurfa GAP Havalimanı (GNY)",
    "Şanlıurfa Otogarı"
  ],
  "Mardin": [
    "Eski Mardin Meydanı (Şehir Merkezi)",
    "Cumhuriyet Meydanı",
    "Mardin Prof. Dr. Aziz Sancar Havalimanı (MQM)",
    "Mardin Otogarı"
  ],
  "Eskişehir": [
    "Adalar (Şehir Merkezi)",
    "Odunpazarı Meydanı",
    "Hasan Polatkan Havalimanı (AOE)",
    "Eskişehir Otogarı",
    "Eskişehir YHT Garı"
  ]
};

// Şehirlere özel özellik/tema bazlı ilgi alanları
const CITY_EXTRA_INTERESTS: Record<string, string[]> = {
  "İstanbul": ["Boğaz Havası", "Bizans & Osmanlı Tarihi", "Sokak Lezzetleri"],
  "Antalya": ["Deniz & Güneş", "Antik Tarih", "Gece Eğlencesi"],
  "İzmir": ["Kordon Keyfi", "Ege Mutfağı", "Tarihi Atmosfer"],
  "Ankara": ["Cumhuriyet Tarihi", "Siyaset & Kültür", "Şehir Parkları"],
  "Nevşehir (Kapadokya)": ["Masalsı Manzara", "Mağara Yaşamı", "Balon Seyri"],
  "Muğla (Bodrum)": ["Lüks Yaşam", "Mavi Yolculuk", "Eğlence"],
  "Muğla (Fethiye)": ["Doğa Sporları", "Turkuaz Sular", "Likya Tarihi"],
  "Muğla (Marmaris)": ["Çam Ormanları", "Mavi Tur", "Köy Hayatı"],
  "Bursa": ["Osmanlı Başkenti", "İskender & Kestane", "Termal Keyfi"],
  "Çanakkale": ["Harp Tarihi", "Mitoloji (Truva)", "Boğaz Manzarası"],
  "Trabzon": ["Karadeniz Yaylaları", "Yeşil Doğa", "Yöresel Mutfak"],
  "Gaziantep": ["Gastronomi Şehri", "Mozaik Sanatı", "Çarşı Kültürü"],
  "Şanlıurfa": ["Peygamberler Şehri", "Mistik Tarih", "Sıra Gecesi"],
  "Mardin": ["Taş Mimari", "Mezopotamya Manzarası", "Kültür Mozaiği"],
  "Eskişehir": ["Öğrenci Kenti", "Avrupai Şehir", "Sanat & Parklar"]
};

const budgetOptions = [
  { value: BudgetType.LOW, label: 'Ekonomik' },
  { value: BudgetType.MEDIUM, label: 'Orta Seviye' },
  { value: BudgetType.HIGH, label: 'Yüksek Seviye' },
  { value: BudgetType.LUXURY, label: 'Lüks / Premium' }
];

const transportOptions = [
  { value: TransportType.WALKING, label: 'Yürüyüş' },
  { value: TransportType.CAR, label: 'Araç' },
  { value: TransportType.PUBLIC_TRANSPORT, label: 'Toplu Taşıma' }
];

const paceOptions = [
  { value: PaceType.RELAXED, label: 'Sakin' },
  { value: PaceType.MODERATE, label: 'Orta' },
  { value: PaceType.INTENSE, label: 'Yoğun' }
];

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading, loadingText }) => {
  const [formData, setFormData] = useState<CreateTripRequest>({
    city: '',
    days: 2,
    transport: TransportType.CAR,
    pace: PaceType.MODERATE,
    budget: BudgetType.MEDIUM,
    interests: [],
    startLocation: '',
    customInterests: ''
  });

  const baseInterestOptions = ['Tarih', 'Yemek', 'Müze', 'Doğa', 'Alışveriş', 'Sanat', 'Fotoğrafçılık'];
  const extraInterests = formData.city ? (CITY_EXTRA_INTERESTS[formData.city] || []) : [];
  const allInterestOptions = [...baseInterestOptions, ...extraInterests];

  const availableStartLocations = formData.city ? CITY_SPECIFIC_LOCATIONS[formData.city] || [] : [];
  const isFormValid = formData.city !== '' && formData.startLocation !== '';

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    const locations = CITY_SPECIFIC_LOCATIONS[newCity] || [];
    const defaultLocation = locations.find(loc => loc.toLowerCase().includes('merkez')) || locations[0] || '';

    // Şehir değişince eski ilgi alanlarını temizle (eğer listede yoksa)
    const newExtraInterests = CITY_EXTRA_INTERESTS[newCity] || [];
    const validInterests = [...baseInterestOptions, ...newExtraInterests];
    const filteredInterests = formData.interests.filter(i => validInterests.includes(i));

    setFormData({
      ...formData,
      city: newCity,
      startLocation: defaultLocation,
      interests: filteredInterests
    });
  };

  const handleDayChange = (delta: number) => {
      setFormData(prev => {
          const newValue = prev.days + delta;
          if (newValue < 1 || newValue > 10) return prev;
          return { ...prev, days: newValue };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onSubmit(formData);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-emerald-900/5 border border-gray-100">
      {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Plan Oluşturuluyor</h3>
                <p className="text-emerald-600 font-medium animate-pulse text-lg">{loadingText}</p>
              </div>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                 <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Seyahatinizi Planlayın</h2>
            </div>

            {/* City Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gidilecek Şehir</label>
              <div className="relative">
                <select
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer text-gray-700"
                    value={formData.city}
                    onChange={handleCityChange}
                >
                    <option value="" disabled>Şehir Seçiniz</option>
                    {POPULAR_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gün Sayısı</label>
              <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                 <button type="button" onClick={() => handleDayChange(-1)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-600 font-medium hover:bg-gray-50">-</button>
                 <span className="font-medium text-gray-900 text-lg">{formData.days} Gün</span>
                 <button type="button" onClick={() => handleDayChange(1)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-600 font-medium hover:bg-gray-50">+</button>
              </div>
            </div>

            {/* Budget Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konaklama Bütçesi</label>
                <div className="relative">
                  <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium appearance-none cursor-pointer text-gray-700 focus:ring-2 focus:ring-emerald-500"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value as BudgetType})}
                  >
                      {budgetOptions.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
            </div>

            {/* Transport & Pace Preference */}
            <div className="grid grid-cols-2 gap-6">
                {/* Pace Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Tempo</label>
                  <div className="flex flex-col gap-2">
                    {paceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, pace: opt.value })}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${formData.pace === opt.value ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Ulaşım</label>
                  <div className="flex flex-col gap-2">
                    {transportOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, transport: opt.value })}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${formData.transport === opt.value ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Start Location Select */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Noktası</label>
               <div className="relative">
                 <select
                     required
                     disabled={!formData.city}
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium appearance-none cursor-pointer text-gray-700 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                     value={formData.startLocation}
                     onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                 >
                     <option value="" disabled>
                        {formData.city ? 'Başlangıç Noktası Seçiniz' : 'Önce Şehir Seçiniz'}
                     </option>
                     {availableStartLocations.map(loc => (
                       <option key={loc} value={loc}>{loc}</option>
                     ))}
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </div>

            {/* Interests */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">İlgi Alanları</label>
               <div className="flex flex-wrap gap-2">
                 {allInterestOptions.map(interest => (
                   <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${formData.interests.includes(interest) ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}>{interest}</button>
                 ))}
               </div>
            </div>

            {/* Notes Section */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Özel İstekler / Notlar</label>
               <textarea 
                  placeholder="Örn: Sadece yerel lezzetler olsun, turistik yerlerden kaçınalım..." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm h-20 resize-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400" 
                  value={formData.customInterests} 
                  onChange={(e) => setFormData({...formData, customInterests: e.target.value})} 
               />
            </div>

            <Button type="submit" fullWidth disabled={isLoading || !isFormValid} className="h-14 text-lg">
              {isLoading ? 'Planlanıyor...' : 'Rotayı Oluştur'}
            </Button>
          </form>
      )}
    </div>
  );
};
