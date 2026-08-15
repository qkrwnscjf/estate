"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Property } from '@/lib/types';

// Custom Map Marker mimicking the Region Node Color (#6B8E6B) for high visibility
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-graph-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background-color: rgba(107, 142, 107, 0.15); animation: pulse 2s infinite;"></div>
        <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(107, 142, 107, 0.9); background-color: rgba(255,255,255,0.8);"></div>
        <div style="width: 8px; height: 8px; background-color: #6B8E6B; border-radius: 50%; box-shadow: 0 0 6px rgba(107, 142, 107, 1);"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const customMarkerIcon = typeof window !== 'undefined' ? createCustomIcon() : undefined;

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map(p => [p.lat!, p.lng!]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [properties, map]);
  return null;
}

export default function MapViewer({ properties, onMarkerClick }: { properties: Property[], onMarkerClick?: (prop: Property) => void }) {
  const defaultCenter: [number, number] = [37.5665, 126.9780];
  const validProps = properties.filter(p => p.lat && p.lng);
  
  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <FitBounds properties={validProps} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {validProps.map((prop, idx) => (
          <Marker 
            key={prop.id || idx} 
            position={[prop.lat!, prop.lng!]} 
            icon={customMarkerIcon!}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(prop);
              }
            }}
          >
            <Popup>
              <div className="font-sans min-w-[200px]">
                <h3 className="font-bold text-[#1A2421] text-lg mb-1">{prop.name}</h3>
                <p className="text-[#647161] text-sm mb-2 leading-snug">{prop.address}</p>
                {prop.contractDate && (
                  <div className="flex items-center text-[11px] font-medium text-[#D98A6C] mb-3 bg-[#FEFEFA] border border-[#D98A6C]/30 px-2 py-1 rounded-md w-fit">
                    <span className="w-1.5 h-1.5 bg-[#D98A6C] rounded-full mr-1.5"></span>
                    최근 실거래: {prop.contractDate}
                  </div>
                )}
                <div className="bg-[#FBFBF7] p-3 rounded-xl border border-[#E5E7E1] mb-2 shadow-sm">
                  <p className="text-xs text-[#647161] mb-1 font-semibold">최근 실거래가</p>
                  <p className="font-bold text-[#2C4C3B] text-base tracking-tight">
                    보증금 {prop.deposit}만<br/>
                    <span className="text-[#6B8E6B]">월세 {prop.monthlyRent}만</span>
                  </p>
                </div>
                {prop.features && prop.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prop.features.map((f, i) => (
                      <span key={i} className="text-[10px] bg-white border border-[#E5E7E1] px-2.5 py-1 rounded-full text-[#647161] font-medium shadow-sm">
                        #{f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
