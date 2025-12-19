import React, { useEffect, useRef } from 'react';
import { DayItem, Place } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  items: DayItem[];
  hotels?: Place[];
  dining?: DayItem[]; // Yemek önerileri prop olarak eklendi
}

const CATEGORY_COLORS: Record<string, string> = {
  RESTAURANT: '#f97316', // Turuncu
  MUSEUM: '#a855f7',     // Mor
  PARK: '#22c55e',       // Yeşil
  HISTORIC: '#f59e0b',   // Sarı/Amber
  CAFE: '#ec4899',       // Pembe
  SHOPPING: '#3b82f6',   // Mavi
  HOTEL: '#4f46e5',      // Indigo
  DEFAULT: '#10b981'     // Standart Yeşil (Asla gri yok)
};

export const MapComponent: React.FC<MapComponentProps> = ({ items, hotels, dining }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !window.L) return;

    if (!mapRef.current) {
      mapRef.current = window.L.map(containerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true
      }).setView([39.0, 35.0], 6);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(mapRef.current);

      window.L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      layerGroupRef.current = window.L.featureGroup().addTo(mapRef.current);
    }

    layerGroupRef.current.clearLayers();
    const bounds = window.L.latLngBounds([]);

    // Rota Markerları (Numaralı)
    items.forEach((item, index) => {
      const { lat, lng, name, category } = item.place;
      if (!lat || !lng) return;

      const catKey = (category || 'DEFAULT').toUpperCase();
      const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.DEFAULT;
      
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color}; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            border: 3px solid white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            font-size: 14px;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      window.L.marker([lat, lng], { icon })
        .bindPopup(`<strong>${name}</strong><br/>${item.startTime}`)
        .addTo(layerGroupRef.current);
      
      bounds.extend([lat, lng]);
    });

    // Otel Markerları
    if (hotels && hotels.length > 0) {
      hotels.forEach(hotel => {
        if (!hotel.lat || !hotel.lng) return;
        const icon = window.L.divIcon({
          className: 'hotel-marker',
          html: `<div style="background: #4f46e5; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3H11v8H5V7H3v14h2v-3h14v3h2V10c0-2.21-1.79-4-4-4z"/></svg></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        window.L.marker([hotel.lat, hotel.lng], { icon }).bindPopup(`<strong>${hotel.name}</strong><br/>Önerilen Otel`).addTo(layerGroupRef.current);
        bounds.extend([hotel.lat, hotel.lng]);
      });
    }

    // Yemek Markerları (Eğer gösteriliyorsa)
    if (dining && dining.length > 0) {
      dining.forEach(item => {
        const { lat, lng, name } = item.place;
        if (!lat || !lng) return;
        const icon = window.L.divIcon({
          className: 'dining-marker',
          // Turuncu Çatal-Bıçak İkonu
          html: `<div style="background: #f97316; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        window.L.marker([lat, lng], { icon }).bindPopup(`<strong>${name}</strong><br/>${item.startTime} - Yemek Önerisi`).addTo(layerGroupRef.current);
        bounds.extend([lat, lng]);
      });
    }

    // Çizgi (Sadece Gezi Noktaları Arasında)
    if (items.length > 1) {
      const validCoords = items.map(i => [i.place.lat, i.place.lng]).filter(c => c[0] && c[1]);
      if (validCoords.length > 1) {
        window.L.polyline(validCoords, { color: '#10b981', weight: 4, dashArray: '10, 10', opacity: 0.5 }).addTo(layerGroupRef.current);
      }
    }

    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [items, hotels, dining]);

  return <div ref={containerRef} className="h-full w-full bg-slate-50" />;
};