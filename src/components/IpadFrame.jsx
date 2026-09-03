import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function IpadFrame({ children, fitMode = 'contain', onToggleFitMode }) {
  const isCover = fitMode === 'cover';

  return (
    <div className="ipad-stage">
      <div className="ipad-chassis">
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
