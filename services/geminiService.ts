import { GoogleGenAI, Type } from "@google/genai";
import { Trip, CreateTripRequest, Place, DayItem, TripDay, PaceType, TransportType } from '../types';

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
        lat: { 
          type: Type.NUMBER, 
          description: "Mekanın gerçek dünyadaki tam enlemi (Latitude). Hassasiyet: En az 6 ondalık basamak. UYDURMA VERİ YASAKTIR." 
        },
        lng: { 
          type: Type.NUMBER, 
          description: "Mekanın gerçek dünyadaki tam boylamı (Longitude). Hassasiyet: En az 6 ondalık basamak. UYDURMA VERİ YASAKTIR." 
        },
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

const fetchMetadata = async (ai: any, request: CreateTripRequest) => {
  logApiCall("fetchMetadata");
  const { city, days, budget, startLocation } = request;
  
  const prompt = `"${city}" için ${days} günlük gezi taslağı oluştur.
    KRİTİK TALİMATLAR:
    1. hotelRecommendations: 4 adet GERÇEK otel önerisi. Koordinatlar (lat, lng) Google Maps verileriyle birebir aynı ve en az 6 hane hassasiyetle olmalı.
    2. cityTransport: cardName, appName ve 1 cümlelik generalAdvice.
    3. arrivalLogistics: "${startLocation}" noktasından merkeze ulaşım özeti.
    4. summaries: Her bir gün için (${days} gün) özetler.
    UYARI: Koordinat bilgileri uydurulamaz. Eğer bir mekanın tam koordinatından emin değilsen o mekanı önerme, emin olduğun gerçek bir mekanı ekle.
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

const fetchDayPlan = async (ai: any, request: CreateTripRequest, dayNumber: number) => {
  logApiCall(`fetchDayPlan (Gün ${dayNumber})`);
  const { city, transport, pace, interests } = request;

  const stopCount = pace === PaceType.RELAXED ? 3 : pace === PaceType.MODERATE ? 5 : 8;
  
  const transportRules = transport === TransportType.WALKING 
    ? "Mekanlar arası mesafe maksimum 15 dk yürüme mesafesinde olmalı. Koordinatlar birbirine çok yakın kümelenmeli." 
    : transport === TransportType.PUBLIC_TRANSPORT 
    ? "Mekanlar toplu taşıma hatlarına yakın seçilmeli." 
    : "Araç ile ulaşım rotası çizilmeli.";

  const prompt = `"${city}" gezisi GÜN ${dayNumber} planı:
    - İlgi Alanları: ${interests.join(', ')}.
    - KONUM KESİNLİĞİ: Her bir mekanın (items ve diningRecommendations) lat ve lng değerleri GERÇEK DÜNYA koordinatları olmalıdır. Uydurma konum bilgisi vermek uygulamanın harita işlevini bozmaktadır. 
    - Hassasiyet: Koordinatları en az 6 ondalık hane ile ver (Örn: 41.008238, 28.978359).
    - Eğer seçilen ilgi alanlarında yeterli mekan yoksa, eksik durakları şehrin bilinen diğer popüler noktalarıyla (gerçek koordinatlarıyla) tamamla.
    - Yemek: Sabah, Öğle, Akşam için 3 adet (diningRecommendations).
    - Ulaşım: ${transport}. ${transportRules}
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

  const metaData = await fetchMetadata(ai, request);
  const dayPromises = Array.from({ length: request.days }, (_, i) => fetchDayPlan(ai, request, i + 1));

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
        contents: `"${city}" şehrindeki "${currentPlace.name}" yerine benzer kategoride (${currentPlace.category}) ama FARKLI ve GERÇEK bir yer öner. 
        UYARI: Yeni önerilen yerin koordinatları (lat, lng) Google Maps üzerindeki gerçek noktası olmalıdır.`,
        config: { responseMimeType: 'application/json', responseSchema: placeSchema }
    });
    return JSON.parse(cleanJsonString(response.text || "{}"));
};