import React, { useState, useEffect } from 'react';
import { Feedback } from '../types';

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
        const data = localStorage.getItem('gezirota_feedback');
        if (data) setFeedbacks(JSON.parse(data));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    // Güvenlik Revizesi: Bilgiler Environment Variable'dan çekiliyor.
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    // KONTROL: Eğer .env dosyası oluşturulmamışsa veya değerler boşsa uyarı ver.
    if (!envUser || !envPass) {
        alert("SİSTEM HATASI:\n\nAdmin giriş bilgileri bulunamadı!\nLütfen ana dizinde '.env' dosyası oluşturup ADMIN_USERNAME ve ADMIN_PASSWORD bilgilerini tanımlayın.");
        return;
    }

    // Bilgiler eşleşiyor mu?
    if (username === envUser && password === envPass) {
        setIsAuthenticated(true);
    } else {
        alert('Hatalı kullanıcı adı veya şifre');
    }
  };

  const handleDelete = (id: string) => {
      const updated = feedbacks.filter(f => f.id !== id);
      setFeedbacks(updated);
      localStorage.setItem('gezirota_feedback', JSON.stringify(updated));
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4 transition-colors">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Yönetici Girişi</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı Adı</label>
                          <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            className="w-full border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-emerald-500" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
                          <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-emerald-500 pr-10" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 translate-y-[-30%] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                )}
                            </button>
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">Giriş Yap</button>
                      <button type="button" onClick={onBack} className="w-full text-gray-500 dark:text-gray-400 text-sm mt-2 hover:text-gray-700 dark:hover:text-gray-200">Ana Sayfaya Dön</button>
                  </form>
              </div>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 transition-colors">
          <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Geri Bildirimler</h1>
                  <button onClick={onBack} className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">Çıkış</button>
              </div>

              {feedbacks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">Henüz mesaj yok.</div>
              ) : (
                  <div className="space-y-4">
                      {feedbacks.map(f => (
                          <div key={f.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 relative">
                              <button onClick={() => handleDelete(f.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600" title="Sil">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                              <div className="flex justify-between items-start mb-2 pr-8">
                                  <h3 className="font-bold text-gray-800 dark:text-white">{f.subject}</h3>
                                  <span className="text-xs text-gray-400">{f.date}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg">{f.message}</p>
                              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Gönderen: {f.name}</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );
};