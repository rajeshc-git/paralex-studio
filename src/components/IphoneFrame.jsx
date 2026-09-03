import React from 'react';
import { Wifi, Battery, Signal, Maximize2, Minimize2 } from 'lucide-react';

export default function IphoneFrame({
  children,
  fitMode = 'contain',
  onToggleFitMode,
  isFrameActive = true
}) {
  if (!isFrameActive) {
    return (
      <div className="borderless-canvas-container">
        {children}
      </div>
    );
  }

  const isCover = fitMode === 'cover';

  return (
    <div className="iphone-stage">
      {/* Outer Titanium/Steel Chassis */}
      <div className="iphone-chassis">
        {/* Hardware side buttons */}
        <div className="iphone-btn-side action-btn" />
        <div className="iphone-btn-side volume-up" />
        <div className="iphone-btn-side volume-down" />
        <div className="iphone-btn-side power-btn" />

        {/* OLED Screen Bezel */}
        <div className="iphone-screen">
          {/* iOS Status Bar */}
          <div className="iphone-statusbar">
            <span className="statusbar-time">9:41</span>

            {/* Dynamic Island */}
            <div className="iphone-dynamic-island">
              <div className="dynamic-island-sensor" />
            </div>

            <div className="statusbar-icons">
              <Signal size={12} strokeWidth={2.4} />
              <Wifi size={12} strokeWidth={2.4} />
              <Battery size={14} strokeWidth={2.4} />
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="iphone-content-layer">
            {children}
          </div>

          {/* Stretch to Full Screen / Fit Photo Floating Button */}
          {onToggleFitMode && (
            <button
              className="iphone-stretch-toggle-btn"
              onClick={onToggleFitMode}
              title={isCover ? 'Fit Original Photo' : 'Stretch to Full Screen'}
            >
              {isCover ? (
                <>
                  <Minimize2 size={12} />
                  <span>Fit Photo</span>
                </>
              ) : (
                <>
                  <Maximize2 size={12} />
                  <span>Stretch to Full Screen</span>
                </>
              )}
            </button>
          )}

          {/* Home indicator bar */}
          <div className="iphone-home-bar" />
        </div>
      </div>
    </div>
  );
}
