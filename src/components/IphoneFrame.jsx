import React from 'react';
import { Wifi, Battery, Signal, Maximize2, Minimize2 } from 'lucide-react';
import { use3DTilt } from '../utils/use3DTilt';

export default function IphoneFrame({
  children,
  fitMode = 'contain',
  onToggleFitMode,
  isFrameActive = true
}) {
  const { transform, boxShadow, glare, onPointerMove, onPointerLeave } = use3DTilt({
    maxTilt: 9.5,
    perspective: 1000,
    scale: 1.025
  });

  if (!isFrameActive) {
    return (
      <div className="borderless-canvas-container">
        {children}
      </div>
    );
  }

  const isCover = fitMode === 'cover';

  return (
    <div
      className="iphone-stage"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Outer Titanium/Steel Chassis with 3D physical tilt */}
      <div
        className="iphone-chassis"
        style={{
          transform,
          boxShadow,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular glass reflection layer */}
        <div
          className="frame-specular-glare"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`
          }}
        />

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
          <div className="iphone-home-bar" />
        </div>
      </div>
    </div>
  );
}
