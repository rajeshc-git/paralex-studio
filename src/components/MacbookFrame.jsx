import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * MacBook Pro / Desktop Ultra-Thin Laptop Bezel Frame
 */
export default function MacbookFrame({
  children,
  aspectRatio,
  fitMode = 'contain',
  onToggleFitMode
}) {
  const isCover = fitMode === 'cover';

  return (
    <div className="macbook-stage">
      <div
        className="macbook-chassis"
        style={{
          aspectRatio: aspectRatio ? `${aspectRatio}` : '16 / 10',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
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
