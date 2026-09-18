import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { use3DTilt } from '../utils/use3DTilt';

export default function IpadFrame({ children, fitMode = 'contain', onToggleFitMode }) {
  const { transform, boxShadow, glare, onPointerMove, onPointerLeave } = use3DTilt({
    maxTilt: 8.5,
    perspective: 1100,
    scale: 1.02
  });
  const isCover = fitMode === 'cover';

  return (
    <div
      className="ipad-stage"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        className="ipad-chassis"
        style={{
          transform,
          boxShadow,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular glass glare reflection */}
        <div
          className="frame-specular-glare"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 65%)`
          }}
        />

        {/* iPad Top Camera Lens */}
        <div className="ipad-camera-dot" />

        {/* OLED Screen Bezel */}
        <div className="ipad-screen">
          <div className="ipad-content-layer">
            {children}
          </div>

          {/* Icon-Only Stretch Toggle Button */}
          {onToggleFitMode && (
            <button
              className="frame-stretch-toggle-btn"
              onClick={onToggleFitMode}
              title={isCover ? 'Fit Original Photo' : 'Stretch to Full Screen'}
            >
              {isCover ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Home indicator bar */}
          <div className="ipad-home-bar" />
        </div>
      </div>
    </div>
  );
}
