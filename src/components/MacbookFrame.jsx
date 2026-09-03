import React from 'react';

/**
 * MacBook Pro / Desktop Ultra-Thin Laptop Bezel Frame
 */
export default function MacbookFrame({ children }) {
  return (
    <div className="macbook-stage">
      <div className="macbook-chassis">
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
        </div>

        {/* Bottom Laptop Hinge & Base Lip */}
        <div className="macbook-bottom-lip">
          <div className="macbook-notch-opener" />
        </div>
      </div>
    </div>
  );
}
