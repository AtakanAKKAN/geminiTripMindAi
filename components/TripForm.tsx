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
  "İstanbul": ["Taksim Meydanı (Şehir Merkezi)", "Sultanahmet (Tarihi Merkez)", "İstanbul Havalimanı (IST)", "Sabiha Gökçen Havalimanı (SAW)", "Esenler Otogarı", "Kadıköy (Anadolu Yakası Merkezi)"],
  "Antalya": ["Kaleiçi (Şehir Merkezi)", "Antalya Havalimanı (AYT)", "Antalya Otogarı", "Konyaaltı Sahili", "Lara Bölgesi"],
  "İzmir": ["Alsancak (Şehir Merkezi)", "Konak Meydanı (Merkez)", "Adnan Menderes Havalimanı (ADB)", "İzmir Otogarı (İZOTAŞ)"],
  "Ankara": ["Kızılay Meydanı (Şehir Merkezi)", "Esenboğa Havalimanı (ESB)", "AŞTİ (Otogar)", "Ulus Meydanı"],
  "Nevşehir (Kapadokya)": ["Göreme (Turistik Merkez)", "Uçhisar", "Ürgüp Merkez", "Nevşehir Havalimanı (NAV)", "Nevşehir Otogarı"],
  "Muğla (Bodrum)": ["Bodrum Merkez (Kale Bölgesi)", "Milas-Bodrum Havalimanı (BJV)", "Bodrum Otogarı"],
  "Muğla (Fethiye)": ["Fethiye Merkez", "Dalaman Havalimanı (DLM)", "Fethiye Otogarı", "Ölüdeniz"],
  "Gaziantep": ["Gaziantep Kalesi (Merkez)", "Gaziantep Havalimanı (GZT)", "Gaziantep Otogarı"],
  "Trabzon": ["Trabzon Meydan (Şehir Merkezi)", "Trabzon Havalimanı (TZX)", "Trabzon Otogarı"],
  "Bursa": ["Ulu Camii (Şehir Merkezi)", "Bursa Otogarı", "İDO Güzelyalı Feribot İskelesi"],
  "Eskişehir": ["Adalar Porsuk Çayı (Merkez)", "Eskişehir Tren Garı", "Eskişehir Otogarı"]
};

const CITY_EXTRA_INTERESTS: Record<string, string[]> = {
  "İstanbul": ["Boğaz Turu", "Bizans Tarihi", "Sokak Lezzetleri"],
  "Antalya": ["Deniz & Plaj", "Antik Kentler", "Şelaleler"],
  "İzmir": ["Kordon Boyu", "Ege Mutfağı", "Antik Efes"],
  "Ankara": ["Cumhuriyet Tarihi", "Müzeler", "Yerel Politika"],
  "Nevşehir (Kapadokya)": ["Balon Turu", "Yeraltı Şehirleri", "Vadiler"],
  "Gaziantep": ["Gastronomi & Kebap", "Baklava", "Mozaik Sanatı"],
  "Muğla (Bodrum)": ["Gece Hayatı", "Mavi Yolculuk", "Lüks Plajlar"],
  "Trabzon": ["Yaylalar", "Karadeniz Mutfağı", "Manastırlar"],
  "Bursa": ["Osmanlı Tarihi", "İskender Kebap", "Termal Sular"],
  "Şanlıurfa": ["Göbeklitepe", "Peygamberler Tarihi", "Sıra Gecesi"],
  "Mardin": ["Taş Mimari", "Süryani Kültürü", "Mezopotamya Manzarası"]
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
  { value: PaceType.RELAXED, label: 'Sakin (2-3 Durak/Gün)' },
  { value: PaceType.MODERATE, label: 'Orta (4-5 Durak/Gün)' },
  { value: PaceType.INTENSE, label: 'Yoğun (6-8 Durak/Gün)' }
  // CUSTOM removed
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

  const availableStartLocations = formData.city ? (CITY_SPECIFIC_LOCATIONS[formData.city] || [`${formData.city} Merkez`]) : [];
  
  // REVİZE 1: Tüm alanlar dolu olmalı ve ilgi alanı seçilmeli
  const isFormValid = 
      formData.city !== '' && 
      formData.startLocation !== '' && 
      formData.interests.length > 0;

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
    const cityLocations = CITY_SPECIFIC_LOCATIONS[newCity] || [`${newCity} Merkez`];
    
    setFormData({
      ...formData,
      city: newCity,
      startLocation: cityLocations[0], // Varsayılan olarak ilk lokasyonu seç
      interests: formData.interests.filter(i => baseInterestOptions.includes(i))
    });
  };

  const handleDayChange = (delta: number) => {
      setFormData(prev => {
          const newValue = prev.days + delta;
          // REVİZE 1: Gün sayısı en fazla 6 olabilir
          if (newValue < 1 || newValue > 6) return prev;
          return { ...prev, days: newValue };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onSubmit(formData);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-emerald-900/5 dark:shadow-none border border-gray-100 dark:border-slate-700 transition-colors duration-300">
      {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Plan Oluşturuluyor</h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse text-lg">{loadingText}</p>
              </div>
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                 <svg className="w-6 h-6 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Seyahatinizi Planlayın</h2>
            </div>

            {/* City Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gidilecek Şehir <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer text-gray-700 dark:text-gray-200"
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

            {/* Start Location Select */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Başlangıç Noktası <span className="text-red-500">*</span></label>
               <div className="relative">
                 <select
                     required
                     disabled={!formData.city}
                     className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none font-medium appearance-none cursor-pointer text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gün Sayısı (Max 6)</label>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-1.5 rounded-xl border border-gray-200 dark:border-slate-600">
                 <button type="button" onClick={() => handleDayChange(-1)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-slate-600 border border-gray-100 dark:border-slate-500 text-gray-600 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-500">-</button>
                 <span className="font-medium text-gray-900 dark:text-white text-lg">{formData.days} Gün</span>
                 <button type="button" onClick={() => handleDayChange(1)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-slate-600 border border-gray-100 dark:border-slate-500 text-gray-600 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-500">+</button>
              </div>
            </div>

            {/* Transport & Pace Preference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transport Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Ulaşım</label>
                  <div className="flex flex-col gap-2">
                    {transportOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, transport: opt.value })}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${formData.transport === opt.value ? 'bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-emerald-200 dark:hover:border-emerald-700'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pace Selection (Updated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Gezi Temposu</label>
                  <div className="flex flex-col gap-2">
                    {paceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, pace: opt.value })}
                        className={`py-3 px-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${formData.pace === opt.value ? 'bg-purple-50/50 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-300 ring-1 ring-purple-500' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-purple-200 dark:hover:border-purple-700'}`}
                      >
                        {opt.label}
                        {formData.pace === opt.value && <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Budget Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bütçe</label>
                <div className="relative">
                  <select
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none font-medium appearance-none cursor-pointer text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value as BudgetType})}
                  >
                      {budgetOptions.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
                  </select>
                </div>
            </div>

            {/* Interests */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">İlgi Alanları <span className="text-red-500">*</span></label>
               <div className="flex flex-wrap gap-2">
                 {allInterestOptions.map(interest => (
                   <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${formData.interests.includes(interest) ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500'}`}>{interest}</button>
                 ))}
               </div>
               {formData.interests.length === 0 && <p className="text-xs text-red-500 mt-2">* En az bir ilgi alanı seçmelisiniz.</p>}
            </div>

            <Button type="submit" fullWidth disabled={isLoading || !isFormValid} className="h-14 text-lg">
              {isLoading ? 'Planlanıyor...' : 'Rotayı Oluştur'}
            </Button>
          </form>
      )}
    </div>
  );
};