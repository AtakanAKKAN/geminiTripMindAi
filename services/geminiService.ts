import { GoogleGenAI, Type } from "@google/genai";
import { Trip, CreateTripRequest, Place, DayItem, TripDay, PaceType } from '../types';

let apiCallCount = 0;

const logApiCall = (method: string) => {
  apiCallCount++;
  console.log(`%c[TripMind AI] API Çağrısı: ${method} | Toplam: ${apiCallCount}`, "color: #10b981; font-weight: bold;");
};

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

// Ortak Şemalar
const transportInfoSchema = {
    type: Type.OBJECT,
    properties: {
        modeAdvice: { type: Type.STRING, description: "Otopark adı veya durak adı ve oraya olan mesafe." }
    }
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
        priceLevel: { type: Type.STRING },
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER },
        description: { type: Type.STRING },
        website: { type: Type.STRING, nullable: true },
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
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

// 1. ADIM: Genel Bilgileri (Otel, Ulaşım, Özetler) Getir
const fetchMetadata = async (ai: any, request: CreateTripRequest) => {
  logApiCall("fetchMetadata");
  const { city, days, budget, startLocation } = request;
  
  const prompt = `"${city}" için ${days} günlük gezi taslağı:
    1. hotelRecommendations: 4 adet otel önerisi (${budget} bütçeye uygun).
    2. cityTransport: cardName, appName ve 1 cümlelik generalAdvice.
    3. arrivalLogistics: "${startLocation}" noktasından merkeze ulaşım özeti.
    4. summaries: Her bir gün için (${days} gün) motive edici 1 cümlelik özetlerin listesi.
    DİL: TÜRKÇE. JSON formatı.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      hotelRecommendations: { type: Type.ARRAY, items: placeSchema },
      cityTransport: {
        type: Type.OBJECT,
        properties: {
          cardName: { type: Type.STRING },
          appName: { type: Type.STRING },
          generalAdvice: { type: Type.STRING }
        },
        required: ["cardName", "appName", "generalAdvice"]
      },
      arrivalLogistics: { type: Type.STRING, nullable: true },
      summaries: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["hotelRecommendations", "cityTransport", "summaries"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema }
  });

  return JSON.parse(cleanJsonString(response.text));
};

// 2. ADIM: Belirli Bir Günün Detaylı Planını Getir
const fetchDayPlan = async (ai: any, request: CreateTripRequest, dayNumber: number) => {
  logApiCall(`fetchDayPlan (Gün ${dayNumber})`);
  const { city, transport, pace, interests } = request;

  const stopCount = pace === PaceType.RELAXED ? "2-3" : pace === PaceType.MODERATE ? "4-5" : "6-8";
  
  const prompt = `"${city}" gezisi GÜN ${dayNumber} planı:
    - İlgi Alanları: ${interests.join(', ')}. (Eksik kalırsa popüler yerler ekle).
    - Durak Sayısı: ${stopCount} adet mekan (items).
    - Yemek: Sabah, Öğle, Akşam için 3 adet (diningRecommendations).
    - Ulaşım Tipi: ${transport}.
    DİL: TÜRKÇE. JSON formatı.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      items: { type: Type.ARRAY, items: dayItemSchema },
      diningRecommendations: { type: Type.ARRAY, items: dayItemSchema }
    },
    required: ["items", "diningRecommendations"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema }
  });

  return JSON.parse(cleanJsonString(response.text));
};

export const createTripWithGemini = async (request: CreateTripRequest, onProgress?: (trip: Partial<Trip>) => void): Promise<Trip> => {
  const ai = getClient();
  if (!ai) throw new Error("API bağlantısı kurulamadı.");

  // Paralel olarak Meta veriyi al
  const metaPromise = fetchMetadata(ai, request);
  
  // Gün planlarını paralel olarak başlat
  const dayPromises = Array.from({ length: request.days }, (_, i) => fetchDayPlan(ai, request, i + 1));

  const metaData = await metaPromise;
  
  // İlk veri geldiğinde arayüzü güncellemek için (App.tsx içinde handle edilecek)
  const initialTrip: Partial<Trip> = {
    id: Date.now().toString(),
    ...request,
    arrivalLogistics: metaData.arrivalLogistics,
    cityTransport: metaData.cityTransport,
    hotelRecommendations: metaData.hotelRecommendations,
    tripDays: []
  };

  if (onProgress) onProgress(initialTrip);

  const dayResults = await Promise.all(dayPromises);

  const tripDays: TripDay[] = dayResults.map((dayData, index) => ({
    id: `day_${index + 1}_${Date.now()}`,
    dayNumber: index + 1,
    summary: metaData.summaries[index] || "Harika bir gün sizi bekliyor.",
    items: dayData.items,
    diningRecommendations: dayData.diningRecommendations
  }));

  return { ...initialTrip, tripDays } as Trip;
};

export const swapPlaceWithGemini = async (city: string, currentPlace: Place): Promise<Place> => {
    logApiCall("swapPlace");
    const ai = getClient();
    if (!ai) throw new Error("Servis bağlantısı yok.");
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `"${city}" şehrindeki "${currentPlace.name}" yerine benzer kategoride (${currentPlace.category}) başka bir yer öner.`,
        config: { responseMimeType: 'application/json', responseSchema: placeSchema }
    });
    return JSON.parse(cleanJsonString(response.text || "{}"));
};