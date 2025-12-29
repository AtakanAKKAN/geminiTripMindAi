import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Mevcut çalışma dizininden env dosyasını yükle
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // API Anahtarını belirle
  const apiKey = process.env.API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  
  // Admin bilgilerini belirle
  const adminUser = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

  return {
    plugins: [react()],
    define: {
      // GÜVENLİK NOTU: 
      // İstemci taraflı (frontend) uygulamalarda bu anahtarlar derleme (build) sırasında
      // kodun içine gömülür ve tarayıcıda görünür hale gelir.
      // API Key'i tamamen gizlemek için bir Backend servisi kullanmanız gerekmektedir.
      'process.env.API_KEY': apiKey ? JSON.stringify(apiKey) : undefined,
      'process.env.ADMIN_USERNAME': adminUser ? JSON.stringify(adminUser) : undefined,
      'process.env.ADMIN_PASSWORD': adminPass ? JSON.stringify(adminPass) : undefined
    }
  };
});