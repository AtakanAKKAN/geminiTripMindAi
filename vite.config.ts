import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Env dosyasından yükle (Local development için)
  // Fix TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. API Anahtarını al.
  // Öncelik sırası: process.env (Vercel) -> env.API_KEY -> env.GEMINI_API_KEY (Kullanıcının dosyası)
  const apiKey = process.env.API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  
  // 3. Admin bilgileri
  const adminUser = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

  return {
    plugins: [react()],
    define: {
      // Kodun içinde 'process.env.API_KEY' yazan her yer, senin GEMINI_API_KEY değerinle değiştirilecek.
      'process.env.API_KEY': apiKey ? JSON.stringify(apiKey) : undefined,
      
      // Admin bilgileri
      'process.env.ADMIN_USERNAME': adminUser ? JSON.stringify(adminUser) : undefined,
      'process.env.ADMIN_PASSWORD': adminPass ? JSON.stringify(adminPass) : undefined
    }
  };
});