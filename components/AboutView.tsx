import React from 'react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center p-6 transition-colors">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <button onClick={onBack} className="mb-8 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center transition-all group">
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
            </button>
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-emerald-200 dark:shadow-none flex-shrink-0">T</div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">TripMind <span className="text-emerald-500">AI</span></h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Yeni Nesil Akıllı Seyahat Asistanı</p>
                </div>
            </div>

            <div className="space-y-10 relative z-10">
                <section>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Biz Kimiz?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        TripMind AI, seyahat tutkusunu yapay zekanın sınırsız gücüyle birleştiren bir teknoloji projesidir. Amacımız, Türkiye'nin saklı kalmış güzelliklerini ve popüler duraklarını, karmaşık planlama süreçlerinden kurtararak size saniyeler içinde sunmaktır.
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-300 mb-4">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="font-black text-emerald-900 dark:text-emerald-200 mb-2">Işık Hızında Planlama</h3>
                        <p className="text-sm text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed font-medium">Gideceğiniz şehri, süreyi ve ilgi alanlarınızı seçin; saniyeler içinde tam teşekküllü rotanız hazır olsun.</p>
                    </div>
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 className="font-black text-blue-900 dark:text-blue-200 mb-2">Güvenli & Yerel</h3>
                        <p className="text-sm text-blue-800/70 dark:text-blue-300/70 leading-relaxed font-medium">Tüm planlarınız cihazınızda saklanır. Kişisel verileriniz asla sunucularımıza gitmez.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Özelliklerimiz
                    </h2>
                    <ul className="space-y-4">
                        {[
                            { t: "Akıllı Rota Optimizasyonu", d: "Yapay zeka, duraklar arasındaki mesafeyi ve vaktinizi en verimli şekilde kullanmanızı sağlar." },
                            { t: "Kişiselleştirilmiş İlgi Alanları", d: "Tarih, gastronomi, doğa veya gece hayatı; rotanız tamamen size özel şekillenir." },
                            { t: "Ulaşım & Konaklama Rehberi", d: "Şehir içi ulaşım ipuçları ve bütçenize uygun otel tavsiyeleri her zaman yanınızda." },
                            { t: "Offline Mod", d: "İnternetiniz olmasa bile daha önce oluşturduğunuz planlara erişmeye devam edin." }
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">{i+1}</div>
                                <div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-base">{item.t}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.d}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/30">
                    <h2 className="text-lg font-black text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Önemli Not
                    </h2>
                    <p className="text-xs text-orange-900/80 dark:text-orange-200/80 leading-relaxed font-bold">
                        TripMind AI, Google Gemini AI tarafından desteklenen deneysel bir projedir. Sunulan bilgiler yapay zeka tarafından üretildiği için güncelliği teyit edilmelidir. Mekanların çalışma saatleri ve durumları için her zaman Google Maps üzerinden kontrol yapmanızı öneririz.
                    </p>
                </section>

                <div className="pt-10 border-t border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.2em]">TripMind AI • v1.2.0 • Türkiye</p>
                </div>
            </div>
        </div>
    </div>
  );
};