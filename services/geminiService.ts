import { GoogleGenAI, Type } from "@google/genai";
import { Trip, CreateTripRequest, Place, DayItem, TripDay, PaceType } from '../types';

const cleanJsonString = (str: string) => {
  if (!str) return "{}";
  let cleaned = str.replace(/```json/g, '').replace(/```/g, '');
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
};

// Şemalar
const transportInfoSchema = {
    type: Type.OBJECT,
    properties: {
        modeAdvice: { type: Type.STRING, description: "Otopark adı veya durak adı ve oraya olan mesafe." }
    }
};

const cityTransportSchema = {
    type: Type.OBJECT,
    properties: {
        cardName: { type: Type.STRING, description: "Şehirde geçerli toplu taşıma kartı adı (Örn: İstanbulkart)." },
        appName: { type: Type.STRING, description: "Şehir için en iyi ulaşım uygulaması (Örn: Mobiett)." },
        generalAdvice: { type: Type.STRING, description: "Şehir içi ulaşımla ilgili 1 cümlelik özet ipucu." }
    },
    required: ["cardName", "appName", "generalAdvice"]
};

const placeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        category: { 
          type: Type.STRING, 
          enum: ["RESTAURANT", "MUSEUM", "PARK", "HISTORIC", "SHOPPING", "CAFE", "HOTEL"],
          description: "Mekan kategorisi."
        },
        rating: { type: Type.NUMBER },
        reviewCount: { type: Type.INTEGER },
        priceLevel: { type: Type.STRING, description: "Fiyat aralığı (Örn: ₺, ₺₺, ₺₺₺)." },
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER },
        description: { type: Type.STRING },
        website: { type: Type.STRING, nullable: true, description: "Varsa resmi web sitesi, yoksa null." },
        transportInfo: transportInfoSchema
    },
    required: ["id", "name", "category", "rating", "lat", "lng", "description", "transportInfo"]
};

const dayItemSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      timeSlot: { type: Type.STRING, enum: ["Morning", "Lunch", "Afternoon", "Dinner", "Evening"] },
      startTime: { type: Type.STRING },
      durationMinutes: { type: Type.INTEGER },
      notes: { type: Type.STRING },
      place: placeSchema
    },
    required: ["id", "timeSlot", "startTime", "place"]
};

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("KRİTİK HATA: API_KEY bulunamadı.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const createTripWithGemini = async (request: CreateTripRequest): Promise<Trip> => {
  const ai = getClient();
  
  if (!ai) {
      throw new Error("Sistem bağlantı anahtarı eksik. Lütfen Vercel panelinden 'Redeploy' işlemini yapın.");
  }

  const { city, days, transport, pace, budget, interests, startLocation } = request;

  const hasFoodInterest = interests.some(i => i.toLowerCase().includes('yemek') || i.toLowerCase().includes('mutfak') || i.toLowerCase().includes('gastronomi'));

  const foodInstruction = hasFoodInterest 
    ? "Kullanıcı 'YEMEK' ilgi alanını seçti. Yemek önerileri (diningRecommendations) ÇOK ÖZEL ve YÖRESEL olsun."
    : "Yemek önerileri standart, temiz ve popüler yerler olsun.";

  // Durak sayısı mantığı
  let stopInstruction = "";
  if (pace === PaceType.RELAXED) {
      stopInstruction = "Her gün için yaklaşık 2-3 adet rahat gezilecek durak oluştur.";
  } else if (pace === PaceType.MODERATE) {
      stopInstruction = "Her gün için yaklaşık 4-5 adet durak oluştur.";
  } else if (pace === PaceType.INTENSE) {
      stopInstruction = "Her gün için yaklaşık 6-8 adet yoğun tempolu durak oluştur.";
  }

  // REVİZE: Başlangıç Noktası Lojistiği
  const isTransitHub = /Havalimanı|Otogar|Gar|Terminal|İstasyon/i.test(startLocation);
  let logisticsPrompt = "";
  
  if (isTransitHub) {
      logisticsPrompt = `
      ÖZEL İSTEK (LOJİSTİK):
      Kullanıcı "${startLocation}" noktasından şehre giriş yapıyor.
      Lütfen JSON çıktısındaki "arrivalLogistics" alanını doldur.
      Bu alanda: "${startLocation} noktasından şehir merkezine veya ilk durağa nasıl gidileceğini" anlat.
      
      - Ulaşım tipi ${transport} olduğu için buna uygun öneri ver.
      - Önemli yerleri, hat numaralarını veya firma isimlerini **iki yıldız** arasına alarak vurgula (Örn: **Havaist-12**, **M1 Metro**, **Avis**).
      - Eğer Araç seçildiyse kiralama şirketlerini, Toplu Taşıma seçildiyse metro/otobüs hatlarını yaz.
      `;
  } else {
      logisticsPrompt = `Başlangıç noktası: ${startLocation}. İlk durağı buna yakın seçmeye çalış. arrivalLogistics alanını boş bırakabilirsin.`;
  }

  const prompt = `
    "${city}" şehri için ${days} günlük bir gezi planı istiyorum.
    
    KURALLAR:
    - Dil: Türkçe. Resmi ve samimi.
    - Ulaşım Tercihi: ${transport}.
    - Bütçe: ${budget}.
    - DURAK SAYISI KURALI: ${stopInstruction}
    
    ${logisticsPrompt}

    1. GEZİ ROTA YAPISI (ITEMS): Sadece turistik/tarihi/kültürel yerler. ${stopInstruction}
    2. YEMEK (DINING): Her gün için 3 öğün önerisi (Sabah, Öğle, Akşam). ${foodInstruction}
    3. KONAKLAMA: 4 otel önerisi.
    4. ULAŞIM: Şehir kartı ve uygulama bilgisi.
    5. GÜNLÜK ÖZET (SUMMARY): Her gün için o günün rotasını anlatan 1 cümlelik kısa, motive edici özet.
    6. KOORDİNATLAR: Gerçek Google Maps koordinatları.
  `;

  const tripResponseSchema = {
      type: Type.OBJECT,
      properties: {
          cityTransport: cityTransportSchema,
          arrivalLogistics: { type: Type.STRING, nullable: true, description: "Eğer başlangıç noktası havalimanı/otogar ise ulaşım rehberi, yoksa null." },
          hotelRecommendations: { type: Type.ARRAY, items: placeSchema },
          tripDays: { 
            type: Type.ARRAY, 
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                dayNumber: { type: Type.INTEGER },
                summary: { type: Type.STRING, description: "O günkü gezi rotasını özetleyen 1 cümlelik motive edici metin." },
                items: { type: Type.ARRAY, items: dayItemSchema },
                diningRecommendations: { type: Type.ARRAY, items: dayItemSchema }
              },
              required: ["id", "dayNumber", "items", "diningRecommendations", "summary"]
            }
          }
      },
      required: ["hotelRecommendations", "tripDays", "cityTransport"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: tripResponseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Yapay zeka boş yanıt döndürdü.");

    const data = JSON.parse(cleanJsonString(text));

    return { 
      id: Date.now().toString(), 
      ...request, 
      arrivalLogistics: data.arrivalLogistics,
      cityTransport: data.cityTransport,
      hotelRecommendations: data.hotelRecommendations || [], 
      tripDays: data.tripDays || []
    };
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || "";
    
    if (errMsg.includes("403") || errMsg.includes("PERMISSION_DENIED")) {
        throw new Error("Erişim reddedildi. Google Cloud Console ayarlarını kontrol edin.");
    }
    
    if (errMsg.includes("429") || errMsg.includes("QUOTA")) {
        throw new Error("Servis şu an yoğun, lütfen saniyeler içinde tekrar deneyin (Kota Limiti).");
    }

    throw new Error(`Plan oluşturulamadı: ${errMsg}`);
  }
};

export const swapPlaceWithGemini = async (city: string, currentPlace: Place): Promise<Place> => {
    const ai = getClient();
    if (!ai) throw new Error("Servis bağlantısı yok.");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `"${city}" şehrindeki "${currentPlace.name}" yerine benzer kategoride (${currentPlace.category}) başka bir yer öner.`,
            config: { 
                responseMimeType: 'application/json', 
                responseSchema: placeSchema 
            }
        });
        return JSON.parse(cleanJsonString(response.text || "{}"));
    } catch { throw new Error("Değişiklik yapılamadı."); }
};