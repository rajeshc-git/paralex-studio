/**
 * Export Services for Paralex 3D Photo Studio:
 * 1. Looping 3D Parallax Video Export (.mp4) with 4-5s Dynamic Cinematic Soundtrack
 * 2. Animated 3D Parallax Image Export (.gif)
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
 * Creates an evolving, cinematic 4.6-second ambient soundtrack with chord progression & glass chimes
 */
function createSoothingAmbientTrack(durationSeconds = 4.6) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    const ctx = new AudioContextClass();
    const destination = ctx.createMediaStreamDestination();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.6);
    masterGain.gain.setValueAtTime(0.45, ctx.currentTime + durationSeconds - 0.7);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);
    masterGain.connect(destination);

    // Warm sub-bass foundation (C2 65.41Hz -> F2 87.31Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(87.31, ctx.currentTime + 2.3);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    subOsc.stop(ctx.currentTime + durationSeconds);

    // Dynamic 2-Stage Harmonic Progression:
    // Stage 1 (0.0s - 2.3s): Lush Cmaj9 (C3, G3, B3, E4, D5)
    // Stage 2 (2.3s - 4.6s): Ethereal Fmaj9 / Am9 (F3, A3, C4, E4, G5)
    const padVoices = [
      { startFreq: 130.81, endFreq: 174.61 }, // C3 -> F3
      { startFreq: 196.00, endFreq: 220.00 }, // G3 -> A3
      { startFreq: 246.94, endFreq: 261.63 }, // B3 -> C4
      { startFreq: 329.63, endFreq: 329.63 }, // E4 -> E4
      { startFreq: 587.33, endFreq: 783.99 }  // D5 -> G5
    ];

    padVoices.forEach((voice, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(voice.startFreq, ctx.currentTime);
      osc.frequency.setTargetAtTime(voice.endFreq, ctx.currentTime + 2.2, 0.4);

      // Lowpass resonant filter with gentle cutoff sweep
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + idx * 110, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(560 + idx * 110, ctx.currentTime + 2.3);
      filter.frequency.linearRampToValueAtTime(380 + idx * 110, ctx.currentTime + durationSeconds);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      // Organic chorus LFO
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.28 + idx * 0.06, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(18, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.14 / padVoices.length, ctx.currentTime);

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(masterGain);

      osc.start();
      lfo.start();
      osc.stop(ctx.currentTime + durationSeconds);
      lfo.stop(ctx.currentTime + durationSeconds);
    });

    // Sparkling Crystal Glass Chime Plucks across the timeline (at 0.4s, 1.4s, 2.6s, 3.6s)
    const chimes = [
      { time: 0.4, freq: 783.99 },  // G5
      { time: 1.3, freq: 987.77 },  // B5
      { time: 2.5, freq: 1174.66 }, // D6
      { time: 3.5, freq: 1318.51 }  // E6
    ];

    chimes.forEach((chime) => {
      if (chime.time < durationSeconds) {
        const chimeOsc = ctx.createOscillator();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(chime.freq, ctx.currentTime + chime.time);

        const chimeGain = ctx.createGain();
        const startT = ctx.currentTime + chime.time;
        chimeGain.gain.setValueAtTime(0.001, startT);
        chimeGain.gain.linearRampToValueAtTime(0.08, startT + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.9);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);

        chimeOsc.start(startT);
        chimeOsc.stop(startT + 0.95);
      }
    });

    return {
      stream: destination.stream,
      cleanup: () => {
        setTimeout(() => {
          try {
            ctx.close();
          } catch (e) {}
        }, (durationSeconds + 0.5) * 1000);
      }
    };
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
    return null;
  }
}

/**
 * Record a lossless 3D parallax tilt loop from a canvas and save as MP4 (with dynamic audio) or GIF
 */
export async function recordParallaxMedia({
  canvas,
  setMouseCoords,
  durationMs = 4600, // 4.6 seconds for rich musical variation
  onProgress,
  format = 'mp4' // 'mp4' | 'gif'
}) {
  if (!canvas) throw new Error('Canvas element required for recording');

  const videoStream = canvas.captureStream(60);
  const streamTracks = [...videoStream.getVideoTracks()];

  let audioCleanup = null;

  // For MP4 exports, synthesize and attach evolving cinematic soundtrack
  if (format === 'mp4') {
    try {
      const ambientAudio = createSoothingAmbientTrack(durationMs / 1000);
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
  }

  const combinedStream = new MediaStream(streamTracks);

  // Determine optimal MIME type based on requested format and browser capability
  let mimeType = '';
  if (format === 'mp4') {
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
  } else {
    // GIF / Animated Image
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }
  }

  const mediaRecorder = new MediaRecorder(
    combinedStream,
    mimeType ? { mimeType } : undefined
  );
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

      // Stable Sequential 2-Axis Parallax:
      // Phase 1 (0.00 -> 0.50): Smooth Horizontal pan (Left -> Right -> Center), Vertical locked at 0
      // Phase 2 (0.50 -> 1.00): Smooth Vertical tilt (Up -> Down -> Center), Horizontal locked at 0
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

      setMouseCoords(simX, simY);

      if (progress < 1) {
        animId = requestAnimationFrame(driveLoop);
      } else {
        cancelAnimationFrame(animId);
        setMouseCoords(0, 0);
        setTimeout(() => {
          mediaRecorder.stop();
        }, 150);
      }
    }

    mediaRecorder.onstop = () => {
      if (audioCleanup) audioCleanup();

      const finalMime = mimeType || (format === 'mp4' ? 'video/mp4' : 'image/gif');
      const blob = new Blob(chunks, { type: finalMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        format === 'mp4' ? 'paralex-3d-motion.mp4' : 'paralex-3d-animation.gif';
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
