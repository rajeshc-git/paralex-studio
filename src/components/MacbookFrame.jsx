import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { use3DTilt } from '../utils/use3DTilt';

/**
 * MacBook Pro / Desktop Ultra-Thin Laptop Bezel Frame with Dual-Layer 3D Physics
 */
export default function MacbookFrame({
  children,
  aspectRatio,
  fitMode = 'contain',
  onToggleFitMode
}) {
  const { transform, boxShadow, glare, onPointerMove, onPointerLeave } = use3DTilt({
    maxTilt: 7.5,
    perspective: 1100,
    scale: 1.018
  });
  const isCover = fitMode === 'cover';

  return (
    <div
      className="macbook-stage"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        className="macbook-chassis"
        style={{
          aspectRatio: aspectRatio ? `${Math.max(1.2, Math.min(aspectRatio, 1.85))}` : '16 / 10',
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
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 65%)`
          }}
        />

        {/* Top FaceTime Camera Center Dot */}
        <div className="macbook-camera-notch">
          <div className="macbook-camera-lens" />
          <div className="macbook-camera-indicator" />
        </div>

        {/* Retina Display Bezel */}
        <div className="macbook-screen">
          <div className="macbook-content-layer">
            {children}
          </div>

          {/* Icon-Only Stretch Toggle Button */}
          {onToggleFitMode && (
            <button
              className="frame-stretch-toggle-btn macbook-pos"
              onClick={onToggleFitMode}
              title={isCover ? 'Fit Original Photo' : 'Stretch to Full Screen'}
            >
              {isCover ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>

        {/* Bottom Laptop Hinge & Base Lip */}
        <div className="macbook-bottom-lip">
          <div className="macbook-notch-opener" />
        </div>
      </div>
    </div>
  );
}
