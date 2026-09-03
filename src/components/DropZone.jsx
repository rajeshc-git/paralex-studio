import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { generateHeuristicDepthMap } from '../utils/depthEstimator';

export default function DropZone({
  onPhotoLoaded,
  presets,
  activePresetId,
  onSelectPreset,
  isProcessing,
  setIsProcessing
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [customDepthPrompt, setCustomDepthPrompt] = useState(false);
  const [manualDepthFile, setManualDepthFile] = useState(null);
  const fileInputRef = useRef(null);
  const depthInputRef = useRef(null);

  // Process a loaded image file
  const processImageFile = (file, explicitDepthFile = null) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (explicitDepthFile) {
          const depthReader = new FileReader();
          depthReader.onload = (de) => {
            onPhotoLoaded({
              image: imgDataUrl,
              depth: de.target.result,
              title: file.name.replace(/\.[^/.]+$/, ''),
              isCustom: true
            });
            setIsProcessing(false);
          };
          depthReader.readAsDataURL(explicitDepthFile);
        } else {
          // Fast intelligent client-side depth extraction
          try {
            const depthDataUrl = generateHeuristicDepthMap(img);
            onPhotoLoaded({
              image: imgDataUrl,
              depth: depthDataUrl,
              title: file.name.replace(/\.[^/.]+$/, ''),
              isCustom: true
            });
          } catch (err) {
            console.error('Error generating depth map:', err);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      img.src = imgDataUrl;
    };

    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let item of e.clipboardData.items) {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Target Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all duration-200 text-center flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processImageFile(e.target.files[0]);
            }
          }}
        />

        {/* Icon with soft pulse */}
        <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
          {isProcessing ? (
            <Sparkles className="animate-spin" size={22} />
          ) : (
            <Upload size={22} />
          )}
        </div>

        <h4 className="text-sm font-semibold text-slate-900 mb-1">
          {isProcessing ? 'Synthesizing Neural Depth Map...' : 'Drop your photo here, or browse'}
        </h4>
        <p className="text-xs text-slate-500 max-w-xs mb-3">
          Upload any 2D photo (JPG, PNG, WebP) or paste from clipboard.
        </p>

        {/* Badges */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 font-medium text-slate-600">
            Auto 3D Depth
          </span>
          <span>•</span>
          <span>Instant WebGL</span>
        </div>
      </div>

      {/* Preset Gallery Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-500" />
            Try Pre-rendered 3D Presets
          </span>
          <span className="text-[11px] text-slate-400">1-click test</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`relative group rounded-xl p-1.5 border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden mb-1.5 bg-slate-900">
                  <img
                    src={preset.image}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="truncate text-[11px] font-semibold text-slate-800">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {preset.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Custom Depth Map Upload Expander */}
      <div className="pt-1">
        {!customDepthPrompt ? (
          <button
            onClick={() => setCustomDepthPrompt(true)}
            className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Layers size={12} />
            <span>Have a custom depth map from iPhone Portrait or AI? (Optional)</span>
          </button>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Custom Depth Map (B&W)</span>
              <button
                onClick={() => setCustomDepthPrompt(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <input
              ref={depthInputRef}
              type="file"
              accept="image/*"
              className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    onPhotoLoaded((prev) => ({
                      ...prev,
                      depth: ev.target.result
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <p className="text-[10px] text-slate-400">
              White pixels = close to camera, Black pixels = background.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
