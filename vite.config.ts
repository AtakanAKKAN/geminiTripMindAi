import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Mevcut çalışma dizininden env dosyasını yükle
  // (process as any) cast işlemi TypeScript hatasını engeller
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // API Anahtarını belirle
  const apiKey = process.env.API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  
  // Admin bilgilerini belirle
  const adminUser = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

  return {
    plugins: [react()],
    
    // 1. BASE AYARI: Uygulamanın kök dizinden çalışmasını garantiye alır.
    // İkon yollarının (/icon-192.png gibi) ve assetlerin doğru çözümlenmesi için önemlidir.
    base: '/', 
    
    // 2. PUBLIC DIR: Statik dosyaların (ikonlar, manifest, robots.txt vb.) bulunduğu klasör.
    // Vite varsayılanı 'public'tir ama açıkça belirtmek olası karışıklıkları önler.
    publicDir: 'public',

    // 3. BUILD AYARI: Çıktı klasörü ve asset yönetimi.
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true, // Her build işleminden önce dist klasörünü temizler.
      sourcemap: false,  // Production için sourcemap'leri kapatarak build boyutunu küçültür.
    },

    define: {
      // GÜVENLİK NOTU: 
      // 'define' işlemi, derleme (build) sırasında koddaki 'process.env.API_KEY' ibaresini
      // doğrudan API anahtarınızın string değeriyle değiştirir.
      // Bu, istemci taraflı (frontend-only) bir uygulama için standarttır.
      'process.env.API_KEY': apiKey ? JSON.stringify(apiKey) : undefined,
      'process.env.ADMIN_USERNAME': adminUser ? JSON.stringify(adminUser) : undefined,
      'process.env.ADMIN_PASSWORD': adminPass ? JSON.stringify(adminPass) : undefined
    }
  };
});