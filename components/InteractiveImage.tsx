
import React, { useState } from 'react';
import { Hotspot } from '../types';

interface InteractiveImageProps {
  src: string;
  hotspots: Hotspot[];
}

const InteractiveImage: React.FC<InteractiveImageProps> = ({ src, hotspots }) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  return (
    <div className="relative group w-full aspect-video overflow-hidden rounded-sm bg-neutral-900 shadow-2xl">
      <img 
        src={src} 
        alt="Interior" 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      
      {/* Hotspots Overlay */}
      <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100">
        {hotspots.map((spot) => (
          <div
            key={spot.id}
            className="absolute group/spot"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onMouseEnter={() => setActiveHotspot(spot)}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            {/* The Dot */}
            <div className="relative">
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] cursor-pointer animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/30 scale-0 group-hover/spot:scale-100 transition-transform duration-300" />
            </div>

            {/* Tooltip */}
            {activeHotspot?.id === spot.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-white/95 backdrop-blur-md text-neutral-900 rounded-md shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">{spot.label}</h4>
                <p className="text-[11px] leading-relaxed opacity-80">{spot.description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/95" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveImage;
