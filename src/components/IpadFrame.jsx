import React from 'react';

export default function IpadFrame({ children }) {
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
          {/* Home indicator bar */}
          <div className="ipad-home-bar" />
        </div>
      </div>
    </div>
  );
}
