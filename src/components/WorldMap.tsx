'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserMemory, WordCard } from '@/lib/types';

// Custom marker icon - subtle and elegant
const createMarkerIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background-color: #f59e0b;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 28px;
          height: 28px;
          background-color: rgba(245, 158, 11, 0.2);
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to fit bounds when markers change
function FitBounds({ memories }: { memories: UserMemory[] }) {
  const map = useMap();

  useEffect(() => {
    if (memories.length === 0) return;

    const bounds = L.latLngBounds(
      memories.map(m => [m.userLocation.lat, m.userLocation.lng] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [map, memories]);

  return null;
}

interface WorldMapProps {
  memories: UserMemory[];
  words: WordCard[];
  onSelectMemory: (memory: UserMemory) => void;
}

export default function WorldMap({ memories, words, onSelectMemory }: WorldMapProps) {
  const markerIcon = createMarkerIcon();

  // Get word for memory
  const getWord = (memory: UserMemory) => words.find(w => w.id === memory.cardId);

  // Default center (Europe)
  const defaultCenter: [number, number] = [52.0, 5.0];
  const defaultZoom = 3;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      attributionControl={false}
    >
      {/* CartoDB Voyager - clean, modern style */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {memories.length > 0 && <FitBounds memories={memories} />}

      {memories.map((memory) => {
        const word = getWord(memory);
        return (
          <Marker
            key={memory.id}
            position={[memory.userLocation.lat, memory.userLocation.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelectMemory(memory)
            }}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <p className="font-serif font-bold text-stone-800">{word?.word}</p>
                <p className="text-xs text-stone-500">{memory.userLocation.name}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
