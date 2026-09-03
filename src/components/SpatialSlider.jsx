import React, { useState } from 'react';
import { haptics } from '../utils/haptics';

/**
 * Futuristic 3D Spatial Slider Component with Native iPhone Taptic Engine Integration
 * Combines a custom futuristic visual HUD (LED ticks, neon fill, glowing thumb)
 * with an underlying native WebKit range surface to trigger real hardware Taptic Engine haptics on iOS Safari.
 */
export default function SpatialSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = '%',
  displayMultiplier = 100,
  onChange,
  icon: Icon
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate percentage (0 to 100)
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    haptics.tick();
  };

  // Display value
  const displayVal = Math.round(value * displayMultiplier);

  return (
    <div className={`spatial-slider-wrapper ${isDragging ? 'dragging' : ''}`}>
      {/* Header Label + Live Digital Readout */}
      <div className="spatial-slider-header">
        <div className="spatial-label-group">
          {Icon && (
            <div className="spatial-slider-icon">
              <Icon size={13} />
            </div>
          )}
          <span className="spatial-slider-label">{label}</span>
        </div>

        <div className={`spatial-readout-pill ${isDragging ? 'active' : ''}`}>
          <span className="readout-num">{displayVal}</span>
          <span className="readout-unit">{unit}</span>
        </div>
      </div>

      {/* Futuristic Interactive 3D Depth Track */}
      <div
        className="spatial-track-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Track with Subtle LED Depth Ticks */}
        <div className="spatial-track-bg">
          <div className="spatial-led-ticks">
            {Array.from({ length: 18 }).map((_, i) => {
              const tickPos = (i / 17) * 100;
              const isLit = tickPos <= percent;
              return (
                <div
                  key={i}
                  className={`spatial-tick ${isLit ? 'lit' : ''}`}
                  style={{ left: `${tickPos}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Dynamic Holographic Neon Fill Bar */}
        <div
          className="spatial-fill-bar"
          style={{ width: `${percent}%` }}
        >
          <div className="spatial-fill-glow" />
        </div>

        {/* Spatial 3D Thumb */}
        <div
          className={`spatial-thumb ${isDragging ? 'grabbing' : ''} ${
            isHovered ? 'hovered' : ''
          }`}
          style={{ left: `${percent}%` }}
        >
          <div className="thumb-outer-ring" />
          <div className="thumb-core-light" />
        </div>

        {/* Native WebKit Touch Range Overlay (Triggers Hardware Taptic Engine on iOS) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          onPointerDown={() => {
            setIsDragging(true);
            haptics.initAudio();
          }}
          onPointerUp={() => setIsDragging(false)}
          onTouchStart={() => {
            setIsDragging(true);
            haptics.initAudio();
          }}
          onTouchEnd={() => setIsDragging(false)}
          className="spatial-native-overlay"
        />
      </div>
    </div>
  );
}
