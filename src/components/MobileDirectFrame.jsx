import React from 'react';
import { Maximize2 } from 'lucide-react';
import { use3DTilt } from '../utils/use3DTilt';

export default function MobileDirectFrame({ children, onOpenFullscreen }) {
  const { transform, boxShadow, glare, onPointerMove, onPointerLeave } = use3DTilt({
    maxTilt: 7,
    perspective: 1000,
    scale: 1.015
  });

  return (
    <div
      className="mobile-direct-canvas-container"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transform,
        boxShadow,
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.15s ease'
      }}
    >
      <div
        className="frame-specular-glare"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 65%)`
        }}
      />
      {children}
      {onOpenFullscreen && (
        <button
          className="frame-stretch-toggle-btn mobile-pos"
          onClick={onOpenFullscreen}
          title="Open Fullscreen 3D View"
        >
          <Maximize2 size={14} />
        </button>
      )}
    </div>
  );
}
