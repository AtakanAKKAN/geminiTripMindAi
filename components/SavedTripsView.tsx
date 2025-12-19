import React, { useEffect, useState } from 'react';
import { Trip } from '../types';

interface SavedTripsViewProps {
  onBack: () => void;
  onLoadTrip: (trip: Trip) => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({ onBack, onLoadTrip }) => {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gezirota_trips');
    if (saved) {
        try {
            setTrips(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse trips", e);
        }
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = trips.filter(t => t.id !== id);
      setTrips(updated);
      localStorage.setItem('gezirota_trips', JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
        <div className="w-full max-w-4xl">
            <button onClick={onBack} className="mb-6 text-gray-500 hover:text-emerald-600 font-medium flex items-center">
                <span className="mr-2">←</span> Ana Sayfaya Dön
            </button>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Kayıtlı Gezilerim</h1>

            {trips.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz gezi planınız yok</h3>
                    <p className="text-gray-500 mb-6">Yeni bir rota oluşturup kaydedin.</p>
                    <button onClick={onBack} className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors">
                        Yeni Plan Oluştur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map(trip => (
                        <div 
                            key={trip.id} 
                            onClick={() => onLoadTrip(trip)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{trip.city}</h2>
                                    <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{trip.days} Günlük Gezi</span>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(trip.id, e)}
                                    className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                    title="Sil"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                                <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                                    {trip.pace === 'RELAXED' ? 'Sakin' : trip.pace === 'MODERATE' ? 'Orta' : 'Yoğun'} Tempo
                                </span>
                                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                                    {trip.transport === 'CAR' ? 'Araç' : trip.transport === 'PUBLIC_TRANSPORT' ? 'Toplu Taşıma' : 'Yürüyüş'}
                                </span>
                            </div>

                             {/* İlgi Alanları Etiketleri */}
                            {trip.interests && trip.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {trip.interests.slice(0, 4).map((interest, idx) => (
                                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 border border-gray-200 text-gray-500 rounded-full">
                                            {interest}
                                        </span>
                                    ))}
                                    {trip.interests.length > 4 && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 text-gray-400">+{trip.interests.length - 4}</span>
                                    )}
                                </div>
                            )}

                            <div className="text-sm text-gray-400 group-hover:text-emerald-600 transition-colors flex items-center mt-auto">
                                Planı Görüntüle →
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};