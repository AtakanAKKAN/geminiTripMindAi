import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Env dosyasından yükle (Local development için)
  // Fix TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. process.env (Vercel Build Environment) veya env dosyası değerini al
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Kodun içindeki 'process.env.API_KEY' metnini, gerçek anahtar değeriyle (string olarak) değiştirir.
      // Eğer anahtar yoksa "undefined" stringi yerine undefined değeri döner.
      'process.env.API_KEY': apiKey ? JSON.stringify(apiKey) : undefined
    }
  };
});