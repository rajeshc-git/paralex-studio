import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Sliders,
  Video,
  Film,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  RotateCw,
  Maximize2,
  X,
  Layers,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

import ParallaxCanvas from './components/ParallaxCanvas';
import IphoneFrame from './components/IphoneFrame';
import IpadFrame from './components/IpadFrame';
import MacbookFrame from './components/MacbookFrame';
import LegalModal from './components/LegalModal';
import SpatialSlider from './components/SpatialSlider';
import { getSamplePresets } from './utils/sampleData';
import { generateHeuristicDepthMap } from './utils/depthEstimator';
import { recordParallaxMedia } from './utils/exportService';
import { getDeviceType } from './utils/deviceDetect';

export default function App() {
  const [step, setStep] = useState(1); // 1: Import, 2: 3D Output
  const [legalModalType, setLegalModalType] = useState(null); // 'terms' | 'privacy' | null
  const [presets, setPresets] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-detect device mode: 'mobile' | 'tablet' | 'desktop'
  const [detectedDevice, setDetectedDevice] = useState('desktop');
  const [activeFrameMode, setActiveFrameMode] = useState('desktop');

  // Original image aspect ratio (width / height)
  const [imageAspect, setImageAspect] = useState(16 / 9);

  // 3D Parallax Settings
  const [intensity, setIntensity] = useState(0.05);
  const [focusPlane, setFocusPlane] = useState(0.5);
  const [iphoneFitMode, setIphoneFitMode] = useState('contain'); // 'contain' | 'cover'

  // Fullscreen Interactive Web View Modal
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);

  // Media recording state (MP4 / GIF)
  const [isRecording, setIsRecording] = useState(false);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [recordProgress, setRecordProgress] = useState(0);

  const canvasHandleRef = useRef(null);
  const fileInputRef = useRef(null);

  // Detect device & load initial presets on mount
  useEffect(() => {
    const devType = getDeviceType();
    setDetectedDevice(devType);

    if (devType === 'mobile') {
      setActiveFrameMode('iphone');
    } else if (devType === 'tablet') {
      setActiveFrameMode('ipad');
    } else {
      setActiveFrameMode('desktop');
    }

    const loadedPresets = getSamplePresets();
    setPresets(loadedPresets);

    // ── Global iOS Gyroscope Permission Request ──
    // iOS 13+ requires DeviceOrientationEvent.requestPermission() from a user gesture on HTTPS.
    // We attach a ONE-TIME click/touchstart listener on the entire document so that
    // the first tap ANYWHERE triggers the iOS permission dialog.
    const needsPermission =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function';

    if (needsPermission) {
      const requestOnFirstGesture = async () => {
        try {
          const state = await DeviceOrientationEvent.requestPermission();
          if (state === 'granted') {
            // Dispatch a custom event so all ParallaxCanvas instances know permission is granted
            window.dispatchEvent(new Event('gyro-permission-granted'));
          }
        } catch (err) {
          console.warn('Gyroscope permission request failed:', err);
        }
        // Remove listener after first attempt (one-shot)
        document.removeEventListener('click', requestOnFirstGesture, true);
        document.removeEventListener('touchend', requestOnFirstGesture, true);
      };

      document.addEventListener('click', requestOnFirstGesture, true);
      document.addEventListener('touchend', requestOnFirstGesture, true);
    }
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
  };

  // Helper to load photo preset & calculate depth map
  const loadPresetWithDepth = (preset) => {
    if (preset.depth) {
      setCurrentPhoto(preset);
      setStep(2);
      return;
    }

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Store original image aspect ratio
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        setImageAspect(w / h);

        const depthDataUrl = generateHeuristicDepthMap(img);
        const updatedPreset = { ...preset, depth: depthDataUrl };
        setPresets((prev) =>
          prev.map((p) => (p.id === preset.id ? updatedPreset : p))
        );
        setCurrentPhoto(updatedPreset);
        setStep(2);
      } catch (err) {
        console.error('Error generating depth map:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert('Unable to fetch sample image.');
    };

    img.src = preset.image;
  };

  // Image file handler for custom uploads
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 800;
          const h = img.naturalHeight || img.height || 600;
          setImageAspect(w / h);

          const depthDataUrl = generateHeuristicDepthMap(img);
          setCurrentPhoto({
            image: imgDataUrl,
            depth: depthDataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            isCustom: true
          });
          setStep(2);
          triggerCelebration();
        } catch (err) {
          console.error('Error generating depth:', err);
        } finally {
          setIsProcessing(false);
        }
      };

      img.src = imgDataUrl;
    };

    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard paste
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let item of e.clipboardData.items) {
          if (item.type.indexOf('image') !== -1) {
            handleImageFile(item.getAsFile());
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // MP4 and GIF recording handler
  const handleExportMedia = async (targetFormat = 'mp4') => {
    if (!canvasHandleRef.current) return;
    const canvas = canvasHandleRef.current.getCanvas();
    if (!canvas) return;

    try {
      setIsRecording(true);
      setExportFormat(targetFormat);
      setRecordProgress(0);

      await recordParallaxMedia({
        canvas,
        format: targetFormat,
        durationMs: 3800,
        setMouseCoords: (x, y) => {
          if (canvasHandleRef.current) {
            canvasHandleRef.current.setOverrideCoords(x, y);
          }
        },
        onProgress: (prog) => {
          setRecordProgress(Math.round(prog * 100));
        }
      });

      if (canvasHandleRef.current) {
        canvasHandleRef.current.releaseOverrideCoords();
      }
      triggerCelebration();
    } catch (err) {
      console.error(err);
      alert('Media export could not complete.');
    } finally {
      setIsRecording(false);
      setRecordProgress(0);
    }
  };

  // Render appropriate frame container based on detected/selected device
  const renderFrameStage = () => {
    if (!currentPhoto) return null;

    const canvasComponent = (
      <ParallaxCanvas
        ref={canvasHandleRef}
        imageSrc={currentPhoto.image}
        depthSrc={currentPhoto.depth}
        intensity={intensity}
        focusPlane={focusPlane}
        fitMode={activeFrameMode === 'iphone' ? iphoneFitMode : 'contain'}
        autoWiggle={true}
        useGyro={true}
      />
    );

    if (activeFrameMode === 'iphone') {
      return (
        <IphoneFrame
          fitMode={iphoneFitMode}
          onToggleFitMode={() =>
            setIphoneFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))
          }
        >
          {canvasComponent}
        </IphoneFrame>
      );
    } else if (activeFrameMode === 'ipad') {
      return <IpadFrame>{canvasComponent}</IpadFrame>;
    } else {
      return <MacbookFrame aspectRatio={imageAspect}>{canvasComponent}</MacbookFrame>;
    }
  };

  return (
    <>
      {/* Main macOS Application Window */}
      <div className="macos-window">
        {/* macOS Window Titlebar */}
        <div className="macos-titlebar">
          <div className="traffic-lights">
            <div className="traffic-light red" title="Close" />
            <div className="traffic-light yellow" title="Minimize" />
            <div className="traffic-light green" title="Zoom" />
          </div>

          {/* Brand Header — Paralex 3D (Centered) */}
          <div className="brand-logo-group">
            <div className="brand-icon-box">
              <Layers size={20} />
            </div>
            <span className="brand-title">
              Paralex <span className="brand-badge-3d">3D</span>
            </span>
          </div>

          {/* Right Aligned Navigation Tabs */}
          <div className="window-right-actions">
            <div className="window-center-control">
              <button
                className={`wizard-tab-btn ${step === 1 ? 'active' : ''}`}
                onClick={() => setStep(1)}
              >
                <Upload size={13} />
                <span>Import</span>
              </button>
              <button
                className={`wizard-tab-btn ${step === 2 ? 'active' : ''}`}
                onClick={() => {
                  if (currentPhoto) setStep(2);
                }}
              >
                <Sparkles size={13} />
                <span>3D Output</span>
              </button>
            </div>
          </div>
        </div>

        {/* Window Body */}
        <div className="window-body">
          {step === 1 ? (
            /* STEP 1: IMPORT IMAGE WIZARD */
            <div className="upload-view-container">
              <div
                className={`macos-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="drop-icon-box">
                  {isProcessing ? (
                    <RotateCw size={26} className="animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>

                <div className="drop-title">
                  {isProcessing ? 'Processing 4K Depth...' : 'Drag & Drop Any Photo'}
                </div>
                <div className="drop-subtitle">
                  Click to browse files or paste directly from clipboard
                </div>

                <div className="drop-pills">
                  <span className="drop-pill">JPG, PNG, WebP</span>
                  <span className="drop-pill">Automatic 3D Depth</span>
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="presets-section">
                <div className="presets-label">4K High-Quality Samples</div>
                <div className="presets-row">
                  {presets.map((p) => {
                    const isSelected = currentPhoto?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`preset-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => loadPresetWithDepth(p)}
                      >
                        <img src={p.image} alt={p.title} className="preset-thumb" />
                        <div className="preset-name">{p.title}</div>
                        <div className="preset-category">{p.tag}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: 3D SPATIAL OUTPUT VIEW */
            <div className="output-view-container">
              {/* 3D Canvas Stage */}
              <div className="canvas-viewport" style={{ aspectRatio: imageAspect }}>
                {renderFrameStage()}
              </div>

              {/* Sidebar Controls Dock */}
              <div className="output-sidebar">
                {/* Header */}
                <div className="sidebar-header-row">
                  <div className="sidebar-title">
                    <Sliders size={16} color="#0071e3" />
                    <span>3D Adjustments</span>
                  </div>
                  <span className="studio-pill">Spatial Studio</span>
                </div>

                {/* Card 1: Futuristic 3D Depth Sliders */}
                <div className="sidebar-card">
                  <SpatialSlider
                    label="3D Depth Strength"
                    value={intensity}
                    min={0.01}
                    max={0.16}
                    step={0.005}
                    unit="%"
                    displayMultiplier={1000}
                    onChange={setIntensity}
                    icon={Layers}
                  />

                  <SpatialSlider
                    label="Focal Focus Point"
                    value={focusPlane}
                    min={0.10}
                    max={0.90}
                    step={0.02}
                    unit="%"
                    displayMultiplier={100}
                    onChange={setFocusPlane}
                    icon={Target}
                  />
                </div>

                {/* Card 2: Device View Selector (Desktop Mode) */}
                {detectedDevice === 'desktop' && (
                  <div className="sidebar-card">
                    <div className="card-sublabel">Device View Mode</div>
                    <div className="device-select-chips">
                      <button
                        className={`device-chip ${activeFrameMode === 'iphone' ? 'active' : ''}`}
                        onClick={() => setActiveFrameMode('iphone')}
                      >
                        <Smartphone size={12} /> iPhone
                      </button>
                      <button
                        className={`device-chip ${activeFrameMode === 'ipad' ? 'active' : ''}`}
                        onClick={() => setActiveFrameMode('ipad')}
                      >
                        <Tablet size={12} /> iPad
                      </button>
                      <button
                        className={`device-chip ${activeFrameMode === 'desktop' ? 'active' : ''}`}
                        onClick={() => setActiveFrameMode('desktop')}
                      >
                        <Monitor size={12} /> Desktop
                      </button>
                    </div>
                  </div>
                )}

                {/* Card 3: Export & Presentation Buttons */}
                <div className="sidebar-card action-card">
                  <div className="export-buttons-stack">
                    <button
                      className="macos-btn-primary"
                      onClick={() => handleExportMedia('mp4')}
                      disabled={isRecording}
                    >
                      {isRecording && exportFormat === 'mp4' ? (
                        <>
                          <RotateCw size={14} className="animate-spin" />
                          <span>Exporting MP4 ({recordProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Video size={14} />
                          <span>Export 3D Video (.mp4)</span>
                        </>
                      )}
                    </button>

                    <div className="secondary-buttons-row">
                      <button
                        className="macos-btn-secondary"
                        onClick={() => handleExportMedia('gif')}
                        disabled={isRecording}
                      >
                        {isRecording && exportFormat === 'gif' ? (
                          <>
                            <RotateCw size={13} className="animate-spin" />
                            <span>{recordProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Film size={13} />
                            <span>Export GIF</span>
                          </>
                        )}
                      </button>

                      <button
                        className="macos-btn-secondary"
                        onClick={() => setIsFullscreenModal(true)}
                      >
                        <Maximize2 size={13} />
                        <span>3D Web View</span>
                      </button>
                    </div>

                    <button
                      className="macos-btn-secondary back-btn"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft size={13} />
                      <span>Choose Another Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* macOS Window Footnote with Policy Hyperlinks */}
        <div className="window-footnote">
          <div className="footnote-links">
            <button
              className="footnote-link-btn"
              onClick={() => setLegalModalType('terms')}
            >
              Terms &amp; Conditions
            </button>
            <span className="footnote-dot">&middot;</span>
            <button
              className="footnote-link-btn"
              onClick={() => setLegalModalType('privacy')}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modal (Terms & Conditions / Privacy Policy) */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        onSwitchType={(newType) => setLegalModalType(newType)}
      />

      {/* ── FULLSCREEN 3D WEB VIEW ─────────────────────────────────────── */}
      {/* Plain full-page, no controls, no dock. Just the 3D canvas filling */}
      {/* the entire screen. Gyroscope auto-detected. Tiny close button.    */}
      {isFullscreenModal && currentPhoto && (
        <div className="fullscreen-3d-overlay">
          {/* Floating close button — top right, minimal */}
          <button
            className="fullscreen-floating-close"
            onClick={() => setIsFullscreenModal(false)}
            title="Exit 3D View"
          >
            <X size={18} />
          </button>

          {/* Full-page canvas — maintains exact original photo aspect ratio without cropping */}
          <div className="fullscreen-stage">
            <div
              className="fullscreen-canvas-box"
              style={{
                aspectRatio: imageAspect ? `${imageAspect}` : '1 / 1',
                width: imageAspect >= 1 ? 'min(100vw, calc(100vh * ' + imageAspect + '))' : 'calc(100vh * ' + imageAspect + ')',
                height: imageAspect <= 1 ? 'min(100vh, calc(100vw / ' + imageAspect + '))' : 'calc(100vw / ' + imageAspect + ')',
                maxWidth: '100vw',
                maxHeight: '100vh'
              }}
            >
              <ParallaxCanvas
                imageSrc={currentPhoto.image}
                depthSrc={currentPhoto.depth}
                intensity={intensity}
                focusPlane={focusPlane}
                overscan={0.02}
                autoWiggle={true}
                useGyro={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
