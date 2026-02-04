import React from 'react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center p-6 transition-colors">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 md:p-12 overflow-y-auto max-h-[85vh] no-scrollbar">
            <button onClick={onBack} className="mb-8 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center transition-all">
                <span className="mr-2">←</span> Ana Sayfaya Dön
            </button>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Gizlilik Politikası</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-10 uppercase tracking-widest">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

            <div className="prose dark:prose-invert max-w-none space-y-8">
                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">1. Giriş</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        TripMind AI ("biz", "uygulama"), kullanıcılarımızın gizliliğine son derece önem verir. Bu politika, uygulamamızı kullandığınızda verilerinizin nasıl işlendiğini, saklandığını ve korunduğunu açıklamaktadır. Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız.
                    </p>
                </section>

                <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <h3 className="text-xl font-black text-blue-900 dark:text-blue-200 mb-3">2. Veri Toplama ve Depolama</h3>
                    <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed font-medium">
                        TripMind AI, **sunucu tabanlı bir veri toplama işlemi yapmaz.** Uygulama içinde oluşturduğunuz tüm gezi rotaları, tercihleriniz ve geçmiş aramalarınız sadece kullandığınız cihazın yerel hafızasında (LocalStorage) saklanır. Bu verilere biz veya herhangi bir üçüncü şahıs uzaktan erişemez.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">3. Kullanılan İzinler</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 font-medium">
                        <li><strong>Konum Bilgisi:</strong> Harita üzerinde yerinizi göstermek ve "Yakınımdaki Yerler" gibi özellikleri kullanabilmeniz için (isteğe bağlı olarak) konum izni istenebilir. Bu veri hiçbir yere iletilmez.</li>
                        <li><strong>İnternet Erişimi:</strong> Yapay zeka ile rota oluşturmak ve harita verilerini yüklemek için internet erişimi gereklidir.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">4. Üçüncü Taraf Servisler</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Uygulamamız işlevselliğini sağlamak adına aşağıdaki güvenilir servisleri kullanır:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600 dark:text-gray-400 font-medium">
                        <li><strong>Google Gemini API:</strong> Rota oluşturma ve metin analizleri için kullanılır.</li>
                        <li><strong>Leaflet & OpenStreetMap:</strong> Harita görselleştirmesi için kullanılır.</li>
                        <li><strong>Google Fonts:</strong> Uygulama arayüz yazı tipleri için kullanılır.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">5. Çocukların Gizliliği</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Uygulamamız 13 yaş altındaki çocuklardan bilerek kişisel veri toplamaz. Tüm veriler yerel olarak saklandığı için ebeveyn denetimi kullanıcı sorumluluğundadır.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">6. Veri Silme Hakları</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Verileriniz cihazınızda tutulduğu için, uygulamayı silmeniz veya tarayıcı önbelleğini temizlemeniz durumunda tüm verileriniz kalıcı olarak silinecektir. Uygulama ayarlarından "Kayıtlı Gezileri Sil" butonunu kullanarak da verilerinizi manuel olarak temizleyebilirsiniz.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3">7. İletişim</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Gizlilik politikamızla ilgili sorularınız için bizimle uygulama içindeki "Geri Bildirim" kısmından veya <strong>tripmind-support@example.com</strong> (örnek adres) üzerinden iletişime geçebilirsiniz.
                    </p>
                </section>

                <div className="pt-8 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase text-center">Bu politika Google Play Geliştirici Programı Politikaları ile uyumludur.</p>
                </div>
            </div>
        </div>
    </div>
  );
};