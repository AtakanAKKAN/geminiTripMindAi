import React from 'react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center p-6 transition-colors">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <button onClick={onBack} className="mb-6 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center">
                <span className="mr-2">←</span> Ana Sayfaya Dön
            </button>
            
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200 dark:shadow-none">T</div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">TripMind AI</h1>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Hakkında
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        TripMind AI, yapay zeka teknolojilerini kullanarak kişiselleştirilmiş şehir gezi planları oluşturan akıllı bir seyahat asistanıdır. Google Gemini altyapısı ile güçlendirilmiş olup, tercihlerinize en uygun rotayı saniyeler içinde hazırlar.
                    </p>
                </section>

                <section className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                    <h2 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Sorumluluk Reddi (Disclaimer)
                    </h2>
                    <p className="text-sm text-orange-900/80 dark:text-orange-200/80 leading-relaxed">
                        Bu uygulamada sunulan gezi rotaları, mekan önerileri ve ulaşım bilgileri yapay zeka tarafından oluşturulmaktadır. Bilgilerin güncelliği (mekanların kapanması, çalışma saatleri değişikliği vb.) garanti edilemez. Gezinize başlamadan önce Google Maps veya ilgili mekanların resmi web siteleri üzerinden teyit etmenizi önemle tavsiye ederiz.
                    </p>
                </section>

                <section className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Gizlilik ve Veri Güvenliği
                    </h2>
                    <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                        TripMind AI, kişisel verilerinize önem verir. Oluşturduğunuz gezi planları ve tercihleriniz <strong>sadece kendi cihazınızda (tarayıcı hafızasında)</strong> saklanmaktadır. Sunucularımızda size ait herhangi bir kişisel veri depolanmamaktadır. Uygulamayı sildiğinizde veya tarayıcı geçmişini temizlediğinizde verileriniz silinir.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">v1.0.0 • Mobile App Release</p>
                </div>
            </div>
        </div>
    </div>
  );
};