

export enum TransportType {
  WALKING = 'WALKING',
  CAR = 'CAR',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT'
}

export enum PaceType {
  RELAXED = 'RELAXED',
  MODERATE = 'MODERATE',
  INTENSE = 'INTENSE'
}

export enum BudgetType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  LUXURY = 'LUXURY'
}

export enum PlaceCategory {
  RESTAURANT = 'RESTAURANT',
  MUSEUM = 'MUSEUM',
  PARK = 'PARK',
  HISTORIC = 'HISTORIC',
  SHOPPING = 'SHOPPING',
  CAFE = 'CAFE',
  PARKING = 'PARKING',
  HOTEL = 'HOTEL'
}

export enum TimeSlot {
  MORNING = 'Morning',
  LUNCH = 'Lunch',
  AFTERNOON = 'Afternoon',
  DINNER = 'Dinner',
  EVENING = 'Evening'
}

export interface TransportInfo {
  modeAdvice: string; // Otopark adı veya Durak adı
  // Diğer alanlar (app, card) artık CityTransportInfo'ya taşındı
}

export interface CityTransportInfo {
    cardName: string; // İstanbulkart
    appName: string; // Mobiett
    generalAdvice: string; // Genel ulaşım tavsiyesi
}

export interface Place {
  id: string;
  name: string;
  category: string; 
  rating: number;
  reviewCount: number;
  priceLevel?: string; 
  lat: number;
  lng: number;
  description: string;
  website?: string; 
  transportInfo?: TransportInfo;
}

export interface DayItem {
  id: string;
  place: Place;
  timeSlot: string;
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface TripDay {
  id: string;
  dayNumber: number;
  items: DayItem[];
  diningRecommendations?: DayItem[]; // Yeni alan: Yemek önerileri (Numarasız)
  summary?: string;
}

export interface Trip {
  id: string;
  city: string;
  days: number;
  transport: TransportType;
  pace: PaceType;
  budget: BudgetType;
  interests: string[];
  startLocation?: string;
  customInterests?: string;
  hotelRecommendations: Place[];
  cityTransport?: CityTransportInfo; 
  tripDays: TripDay[];
}

export interface CreateTripRequest {
  city: string;
  days: number;
  transport: TransportType;
  pace: PaceType;
  budget: BudgetType;
  interests: string[];
  startLocation: string;
  customInterests: string;
}