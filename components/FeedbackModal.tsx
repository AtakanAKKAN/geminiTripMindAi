import React, { useState } from 'react';
import { Feedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // LocalStorage'a kaydetme mantığı
    const newFeedback: Feedback = {
        id: Date.now().toString(),
        name: formData.name,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toLocaleDateString('tr-TR')
    };

    const existingData = localStorage.getItem('gezirota_feedback');
    const feedbacks: Feedback[] = existingData ? JSON.parse(existingData) : [];
    feedbacks.unshift(newFeedback);
    localStorage.setItem('gezirota_feedback', JSON.stringify(feedbacks));

    setSuccess(true);
    setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', subject: '', message: '' });
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-700">
        <div className="bg-emerald-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                Geri Bildirim Gönder
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {success ? (
            <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Teşekkürler!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Geri bildiriminiz başarıyla iletildi.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim Soyisim</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Adınız"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konu</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Örn: Uygulama Hatası"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mesajınız 
                        <span className={`ml-2 text-xs ${formData.message.length > 300 ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                            ({formData.message.length}/350)
                        </span>
                    </label>
                    <textarea 
                        required
                        maxLength={350}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                        placeholder="Fikirlerinizi bizimle paylaşın..."
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                    Gönder
                </button>
            </form>
        )}
      </div>
    </div>
  );
};