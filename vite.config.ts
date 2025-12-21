import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Env dosyasından yükle (Local development için)
  // Fix TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. process.env (Vercel Build Environment) veya env dosyası değerini al
  const apiKey = process.env.API_KEY || env.API_KEY;
  
  // REVİZE: Hardcoded fallback değerler kaldırıldı.
  // Kullanıcı adı ve şifre sadece ENV dosyasından veya sistem değişkenlerinden okunacak.
  const adminUser = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

  return {
    plugins: [react()],
    define: {
      // Kodun içindeki 'process.env.API_KEY' metnini, gerçek anahtar değeriyle (string olarak) değiştirir.
      'process.env.API_KEY': apiKey ? JSON.stringify(apiKey) : undefined,
      
      // Admin bilgileri env üzerinden okunacak, tanımlı değilse undefined kalır
      'process.env.ADMIN_USERNAME': adminUser ? JSON.stringify(adminUser) : undefined,
      'process.env.ADMIN_PASSWORD': adminPass ? JSON.stringify(adminPass) : undefined
    }
  };
});