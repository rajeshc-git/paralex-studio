import React from 'react';
import { Sliders, Eye, EyeOff, Smartphone, Monitor, RefreshCw, Compass, Waves } from 'lucide-react';

export default function ControlsBar({
  intensity,
  setIntensity,
  focusPlane,
  setFocusPlane,
  autoWiggle,
  setAutoWiggle,
  showDepth,
  setShowDepth,
  invertDepth,
  setInvertDepth,
  isPhoneFrame,
  setIsPhoneFrame,
  onResetControls
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Sliders size={16} className="text-blue-600" />
          <span>3D Spatial Controls</span>
        </div>
        <button
          onClick={onResetControls}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          title="Reset to default values"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Parallax Intensity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Parallax Depth</span>
            <span className="text-blue-600 font-semibold">{Math.round(intensity * 1000)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.12"
            step="0.005"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Focal Plane Offset */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Focal Anchor (Zero-Shift)</span>
            <span className="text-blue-600 font-semibold">{Math.round(focusPlane * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={focusPlane}
            onChange={(e) => setFocusPlane(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Quick Toggles Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Auto Wiggle / Float */}
        <button
          onClick={() => setAutoWiggle(!autoWiggle)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            autoWiggle
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Waves size={13} className={autoWiggle ? 'animate-pulse' : ''} />
          <span>Auto-Tilt Wiggle</span>
        </button>

        {/* Inspect Depth Map */}
        <button
          onClick={() => setShowDepth(!showDepth)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            showDepth
              ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {showDepth ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{showDepth ? 'Hide Depth Map' : 'Inspect Depth Map'}</span>
        </button>

        {/* Invert Depth Map */}
        <button
          onClick={() => setInvertDepth(!invertDepth)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            invertDepth
              ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Invert Depth</span>
        </button>

        {/* Frame Toggle */}
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-all"
        >
          {isPhoneFrame ? (
            <>
              <Monitor size={13} />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone size={13} />
              <span>iPhone Bezel</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
