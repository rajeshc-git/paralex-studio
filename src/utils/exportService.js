import * as THREE from 'three';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

/**
 * Download depth map utility
 */
export function downloadDepthMap(depthMapDataUrl, filename = 'paralex-depth-map.png') {
  const link = document.createElement('a');
  link.href = depthMapDataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Synthesizes a lush, modern 10-second Chill Pop / Lofi ambient soundtrack
 * with warm electric Rhodes chord progression (Fmaj9 -> G6 -> Am9 -> Cmaj7),
 * deep velvet bass, and ethereal melody accents.
 */
function createChillPopAmbientTrack(durationSeconds = 10.0) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    const ctx = new AudioContextClass();
    const destination = ctx.createMediaStreamDestination();

    // Master volume bus with smooth fade-in and fade-out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.48, ctx.currentTime + 0.8);
    masterGain.gain.setValueAtTime(0.48, ctx.currentTime + durationSeconds - 1.0);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);
    masterGain.connect(destination);

    // Warm spatial delay network (reverb simulation)
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.32;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1800;

    delay.connect(delayFeedback);
    delayFeedback.connect(delayFilter);
    delayFilter.connect(delay);
    delay.connect(masterGain);

    // 4-Chord Chill Pop Progression across 10 seconds (2.5s per chord):
    // 1. Fmaj9 (0.0s - 2.5s)
    // 2. G6    (2.5s - 5.0s)
    // 3. Am9   (5.0s - 7.5s)
    // 4. Cmaj7 (7.5s - 10.0s)
    const chords = [
      { start: 0.0, end: 2.5, bass: 43.65, notes: [220.00, 261.63, 329.63, 392.00] }, // F bass, A3, C4, E4, G4
      { start: 2.5, end: 5.0, bass: 48.99, notes: [246.94, 293.66, 329.63, 392.00] }, // G bass, B3, D4, E4, G4
      { start: 5.0, end: 7.5, bass: 55.00, notes: [261.63, 329.63, 392.00, 493.88] }, // A bass, C4, E4, G4, B4
      { start: 7.5, end: 10.0, bass: 65.41, notes: [329.63, 392.00, 493.88, 587.33] }  // C bass, E4, G4, B4, D5
    ];

    chords.forEach((chord) => {
      const startTime = ctx.currentTime + chord.start;
      const duration = chord.end - chord.start;
      const stopTime = startTime + duration + 0.35;

      // 1. Warm Velvet Sub-Bass
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(chord.bass, startTime);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.001, startTime);
      bassGain.gain.linearRampToValueAtTime(0.24, startTime + 0.15);
      bassGain.gain.setValueAtTime(0.22, startTime + duration - 0.2);
      bassGain.gain.exponentialRampToValueAtTime(0.001, stopTime);

      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(startTime);
      bassOsc.stop(stopTime);

      // 2. Lush Rhodes / Chill Pop Keyboard Voices
      chord.notes.forEach((freq, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Subtle detune for rich acoustic shimmer
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 1.002, startTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550 + idx * 80, startTime);
        filter.frequency.exponentialRampToValueAtTime(1150 + idx * 90, startTime + 0.3);
        filter.frequency.exponentialRampToValueAtTime(450 + idx * 60, startTime + duration);

        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(0.001, startTime);
        voiceGain.gain.linearRampToValueAtTime(0.06, startTime + 0.12);
        voiceGain.gain.setValueAtTime(0.048, startTime + duration - 0.2);
        voiceGain.gain.exponentialRampToValueAtTime(0.001, stopTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(masterGain);
        voiceGain.connect(delay);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(stopTime);
        osc2.stop(stopTime);
      });
    });

    // 3. Ethereal Melody Accents (Soft, warm acoustic drops at musical beats)
    const melody = [
      { time: 0.8, freq: 587.33 },  // D5
      { time: 1.8, freq: 659.25 },  // E5
      { time: 3.3, freq: 783.99 },  // G5
      { time: 4.3, freq: 659.25 },  // E5
      { time: 5.8, freq: 880.00 },  // A5
      { time: 6.8, freq: 783.99 },  // G5
      { time: 8.3, freq: 987.77 },  // B5
      { time: 9.0, freq: 880.00 }   // A5
    ];

    melody.forEach((note) => {
      const startTime = ctx.currentTime + note.time;
      if (note.time < durationSeconds - 0.6) {
        const bellOsc = ctx.createOscillator();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(note.freq, startTime);

        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(0.001, startTime);
        bellGain.gain.linearRampToValueAtTime(0.045, startTime + 0.04);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        bellOsc.connect(bellGain);
        bellGain.connect(masterGain);
        bellGain.connect(delay);

        bellOsc.start(startTime);
        bellOsc.stop(startTime + 1.3);
      }
    });

    return {
      stream: destination.stream,
      cleanup: () => {
        setTimeout(() => {
          try {
            ctx.close();
          } catch (e) {}
        }, (durationSeconds + 1.0) * 1000);
      }
    };
  } catch (err) {
    console.warn('Web Audio Chill Pop synth error:', err);
    return null;
  }
}

const ExportShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uImage;
    uniform sampler2D uDepthMap;
    uniform vec2 uMouse;
    uniform float uIntensity;
    uniform float uFocus;
    uniform float uOverscan;
    uniform float uInvert;
    uniform float uFitMode;
    uniform vec2 uResolution;
    uniform vec2 uImageAspect;
    varying vec2 vUv;

    void main() {
      vec2 st = vUv;
      float screenAspect = uResolution.x / uResolution.y;
      float imgAspect = uImageAspect.x / uImageAspect.y;

      vec2 uvFit = st;
      if (abs(screenAspect - imgAspect) > 0.005) {
        if (uFitMode > 0.5) {
          if (screenAspect > imgAspect) {
            float ratio = imgAspect / screenAspect;
            uvFit.y = (st.y - 0.5) * ratio + 0.5;
          } else {
            float ratio = screenAspect / imgAspect;
            uvFit.x = (st.x - 0.5) * ratio + 0.5;
          }
        } else {
          if (screenAspect > imgAspect) {
            float ratio = screenAspect / imgAspect;
            uvFit.x = (st.x - 0.5) * ratio + 0.5;
            if (uvFit.x < 0.0 || uvFit.x > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
            }
          } else {
            float ratio = imgAspect / screenAspect;
            uvFit.y = (st.y - 0.5) * ratio + 0.5;
            if (uvFit.y < 0.0 || uvFit.y > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
            }
          }
        }
      }

      vec2 centeredUv = (uvFit - 0.5) * (1.0 - uOverscan) + 0.5;
      vec4 depthColor = texture2D(uDepthMap, centeredUv);
      float rawDepth = depthColor.r;
      if (uInvert > 0.5) {
        rawDepth = 1.0 - rawDepth;
      }

      float depthOffset = rawDepth - uFocus;
      vec2 parallax = uMouse * depthOffset * uIntensity;
      vec2 sampleUv = clamp(centeredUv + parallax, 0.001, 0.999);

      gl_FragColor = texture2D(uImage, sampleUv);
    }
  `
};

/**
 * Creates an offscreen WebGL context rendering at crisp 1080p+ HD resolution
 */
function createHighResRenderer(width, height, imageSrc, depthSrc, intensity, focusPlane, overscan = 0.02, fitMode = 'contain') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const textureLoader = new THREE.TextureLoader();
    let imgTexture = null;
    let depthTexture = null;
    let loadedCount = 0;

    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        const material = new THREE.ShaderMaterial({
          vertexShader: ExportShader.vertexShader,
          fragmentShader: ExportShader.fragmentShader,
          uniforms: {
            uImage: { value: imgTexture },
            uDepthMap: { value: depthTexture },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uIntensity: { value: intensity },
            uFocus: { value: focusPlane },
            uOverscan: { value: overscan },
            uFitMode: { value: fitMode === 'cover' ? 1.0 : 0.0 },
            uInvert: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(width, height) },
            uImageAspect: {
              value: new THREE.Vector2(
                imgTexture.image?.width || width,
                imgTexture.image?.height || height
              )
            }
          }
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        resolve({
          canvas,
          renderer,
          scene,
          camera,
          material,
          renderFrame: (x, y) => {
            material.uniforms.uMouse.value.set(x, y);
            renderer.render(scene, camera);
          },
          dispose: () => {
            geometry.dispose();
            material.dispose();
            imgTexture?.dispose();
            depthTexture?.dispose();
            renderer.dispose();
          }
        });
      }
    };

    imgTexture = textureLoader.load(imageSrc, (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      checkDone();
    }, undefined, reject);

    depthTexture = textureLoader.load(depthSrc, (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      checkDone();
    }, undefined, reject);
  });
}

/**
 * Export high-definition 1080p+ MP4 Video or true animated GIF
 */
export async function recordParallaxMedia({
  imageSrc,
  depthSrc,
  intensity = 0.05,
  focusPlane = 0.5,
  overscan = 0.02,
  fitMode = 'contain',
  aspectRatio = 16 / 9,
  durationMs = 10000, // 10.0 seconds full HD video
  onProgress,
  format = 'mp4',
  canvas: fallbackCanvas,
  setMouseCoords
}) {
  let renderWidth = 1920;
  let renderHeight = 1080;

  const validAspect = aspectRatio && aspectRatio > 0 ? aspectRatio : 16 / 9;

  if (validAspect >= 1) {
    renderWidth = 1920;
    renderHeight = Math.round(1920 / validAspect);
  } else {
    renderHeight = 1920;
    renderWidth = Math.round(1920 * validAspect);
  }

  // Force even dimensions
  renderWidth = renderWidth % 2 === 0 ? renderWidth : renderWidth + 1;
  renderHeight = renderHeight % 2 === 0 ? renderHeight : renderHeight + 1;

  renderWidth = Math.max(720, Math.min(2560, renderWidth));
  renderHeight = Math.max(720, Math.min(2560, renderHeight));

  if (imageSrc && depthSrc) {
    if (format === 'gif') {
      return exportHighResGif({
        width: Math.min(960, renderWidth),
        height: Math.min(960, renderHeight),
        imageSrc,
        depthSrc,
        intensity,
        focusPlane,
        overscan,
        fitMode,
        durationMs: Math.min(4500, durationMs), // Optimized snappy loop for GIF
        onProgress
      });
    } else {
      return exportHighResMp4({
        width: renderWidth,
        height: renderHeight,
        imageSrc,
        depthSrc,
        intensity,
        focusPlane,
        overscan,
        fitMode,
        durationMs: Math.max(8000, durationMs), // 10s for MP4
        onProgress
      });
    }
  }

  if (!fallbackCanvas) throw new Error('Photo assets or canvas required for export');
  return exportDirectCanvasFallback({
    canvas: fallbackCanvas,
    setMouseCoords,
    durationMs,
    onProgress,
    format
  });
}

/**
 * 10-Second 1080p High-Definition MP4 Video Exporter with 25 Mbps Bitrate & Chill Pop Soundtrack
 */
async function exportHighResMp4({
  width,
  height,
  imageSrc,
  depthSrc,
  intensity,
  focusPlane,
  overscan,
  fitMode,
  durationMs = 10000,
  onProgress
}) {
  const engine = await createHighResRenderer(
    width,
    height,
    imageSrc,
    depthSrc,
    intensity,
    focusPlane,
    overscan,
    fitMode
  );

  const videoStream = engine.canvas.captureStream(60);
  const streamTracks = [...videoStream.getVideoTracks()];

  let audioCleanup = null;
  try {
    const ambientAudio = createChillPopAmbientTrack(durationMs / 1000);
    if (ambientAudio && ambientAudio.stream) {
      const audioTracks = ambientAudio.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        streamTracks.push(audioTracks[0]);
        audioCleanup = ambientAudio.cleanup;
      }
    }
  } catch (e) {
    console.warn('Audio generation skipped:', e);
  }

  const combinedStream = new MediaStream(streamTracks);

  let mimeType = '';
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
    mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    mimeType = 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: mimeType || undefined,
    videoBitsPerSecond: 25_000_000,
    audioBitsPerSecond: 256_000
  });

  const chunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let animId;

    function driveLoop(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      if (onProgress) onProgress(progress);

      // 10-Second 2-Stage Cinematic Parallax Motion:
      // Stage 1 (0.00 - 0.50): Smooth horizontal pan with subtle breathing curve
      // Stage 2 (0.50 - 1.00): Fluid vertical tilt & gentle orbital arc
      let simX = 0;
      let simY = 0;

      if (progress < 0.5) {
        const p = progress / 0.5;
        simX = Math.sin(p * Math.PI * 2) * 1.15;
        simY = Math.sin(p * Math.PI * 4) * 0.2;
      } else {
        const p = (progress - 0.5) / 0.5;
        simX = Math.sin(p * Math.PI * 4) * 0.25;
        simY = Math.sin(p * Math.PI * 2) * 1.15;
      }

      engine.renderFrame(simX, simY);

      if (progress < 1) {
        animId = requestAnimationFrame(driveLoop);
      } else {
        cancelAnimationFrame(animId);
        setTimeout(() => {
          mediaRecorder.stop();
        }, 150);
      }
    }

    mediaRecorder.onstop = () => {
      if (audioCleanup) audioCleanup();
      engine.dispose();

      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType || 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paralex-3d-10s-1080p.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    };

    mediaRecorder.onerror = (err) => {
      cancelAnimationFrame(animId);
      if (audioCleanup) audioCleanup();
      engine.dispose();
      reject(err);
    };

    mediaRecorder.start();
    animId = requestAnimationFrame(driveLoop);
  });
}

/**
 * True High-Resolution Animated GIF Exporter with Color Palette Quantization
 */
async function exportHighResGif({
  width,
  height,
  imageSrc,
  depthSrc,
  intensity,
  focusPlane,
  overscan,
  fitMode,
  durationMs = 4000,
  onProgress
}) {
  const engine = await createHighResRenderer(
    width,
    height,
    imageSrc,
    depthSrc,
    intensity,
    focusPlane,
    overscan,
    fitMode
  );

  const gif = GIFEncoder();
  const totalFrames = 36;
  const frameDelay = 60; // 60ms = ~16.6 fps smooth animation

  const helperCanvas = document.createElement('canvas');
  helperCanvas.width = width;
  helperCanvas.height = height;
  const helperCtx = helperCanvas.getContext('2d', { willReadFrequently: true });

  for (let f = 0; f < totalFrames; f++) {
    const progress = f / totalFrames;
    if (onProgress) onProgress(progress * 0.95);

    let simX = 0;
    let simY = 0;

    if (progress < 0.5) {
      const p = progress / 0.5;
      simX = Math.sin(p * Math.PI * 2) * 1.15;
      simY = 0;
    } else {
      const p = (progress - 0.5) / 0.5;
      simX = 0;
      simY = Math.sin(p * Math.PI * 2) * 1.15;
    }

    engine.renderFrame(simX, simY);

    helperCtx.drawImage(engine.canvas, 0, 0);
    const imgData = helperCtx.getImageData(0, 0, width, height);

    const palette = quantize(imgData.data, 256);
    const index = applyPalette(imgData.data, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay: frameDelay,
      repeat: 0
    });

    await new Promise((r) => setTimeout(r, 8));
  }

  gif.finish();
  engine.dispose();

  if (onProgress) onProgress(1);

  const buffer = gif.bytes();
  const blob = new Blob([buffer], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'paralex-3d-animation.gif';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Direct Canvas Fallback Exporter
 */
async function exportDirectCanvasFallback({
  canvas,
  setMouseCoords,
  durationMs = 10000,
  onProgress,
  format = 'mp4'
}) {
  const videoStream = canvas.captureStream(60);
  const streamTracks = [...videoStream.getVideoTracks()];

  let audioCleanup = null;
  if (format === 'mp4') {
    try {
      const ambientAudio = createChillPopAmbientTrack(durationMs / 1000);
      if (ambientAudio && ambientAudio.stream) {
        const audioTracks = ambientAudio.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          streamTracks.push(audioTracks[0]);
          audioCleanup = ambientAudio.cleanup;
        }
      }
    } catch (e) {}
  }

  const combinedStream = new MediaStream(streamTracks);
  const mediaRecorder = new MediaRecorder(combinedStream, {
    videoBitsPerSecond: 25_000_000,
    audioBitsPerSecond: 256_000
  });
  const chunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let animId;

    function driveLoop(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      if (onProgress) onProgress(progress);

      let simX = 0;
      let simY = 0;

      if (progress < 0.5) {
        const p = progress / 0.5;
        simX = Math.sin(p * Math.PI * 2) * 1.15;
        simY = Math.sin(p * Math.PI * 4) * 0.2;
      } else {
        const p = (progress - 0.5) / 0.5;
        simX = Math.sin(p * Math.PI * 4) * 0.25;
        simY = Math.sin(p * Math.PI * 2) * 1.15;
      }

      if (setMouseCoords) setMouseCoords(simX, simY);

      if (progress < 1) {
        animId = requestAnimationFrame(driveLoop);
      } else {
        cancelAnimationFrame(animId);
        if (setMouseCoords) setMouseCoords(0, 0);
        setTimeout(() => mediaRecorder.stop(), 150);
      }
    }

    mediaRecorder.onstop = () => {
      if (audioCleanup) audioCleanup();
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'mp4' ? 'paralex-3d-10s.mp4' : 'paralex-3d.gif';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    };

    mediaRecorder.onerror = (err) => {
      cancelAnimationFrame(animId);
      if (audioCleanup) audioCleanup();
      reject(err);
    };

    mediaRecorder.start();
    animId = requestAnimationFrame(driveLoop);
  });
}
