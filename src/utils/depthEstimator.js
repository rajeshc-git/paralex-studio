/**
 * iPhone-Style Parallax Depth Map Generator
 *
 * The key to the iPhone parallax 3D photo effect:
 * - The FOREGROUND subject (face, car, person) must be a SOLID, UNIFORM depth plane.
 *   It must NOT have per-pixel depth variation based on luminance/color — that causes
 *   facial features to tear and warp.
 * - The BACKGROUND should have a LOWER depth value and slight gradient.
 * - The transition between foreground and background should be smooth but clear.
 *
 * This creates the classic effect where the background slides behind a rock-solid
 * subject when you tilt the device.
 *
 * Strategy:
 *   1. Create a radial "subject mask" — center of image = foreground (high depth),
 *      edges = background (low depth).
 *   2. Detect edges in the source image to find subject boundaries.
 *   3. Use the edges to refine the mask so depth transitions align with actual
 *      object edges rather than cutting through the face.
 *   4. Apply VERY heavy Gaussian-like smoothing so depth is buttery smooth within
 *      each region (no per-pixel jitter).
 */

export function generateHeuristicDepthMap(imageElement, options = {}) {
  const {
    invert = false
  } = options;

  const width = Math.min(imageElement.naturalWidth || imageElement.width || 600, 512);
  const height = Math.min(imageElement.naturalHeight || imageElement.height || 600, 512);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Draw source image
  ctx.drawImage(imageElement, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // ── Step 1: Compute grayscale luminance ──
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    lum[i] = (0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2]) / 255;
  }

  // ── Step 2: Edge detection (simple Sobel magnitude) ──
  // We use edges to know WHERE the subject boundary is, NOT for depth value.
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = lum[(y - 1) * width + (x - 1)];
      const tc = lum[(y - 1) * width + x];
      const tr = lum[(y - 1) * width + (x + 1)];
      const ml = lum[y * width + (x - 1)];
      const mr = lum[y * width + (x + 1)];
      const bl = lum[(y + 1) * width + (x - 1)];
      const bc = lum[(y + 1) * width + x];
      const br = lum[(y + 1) * width + (x + 1)];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // ── Step 3: Create the base depth map as a RADIAL subject mask ──
  // Center of image = foreground (depth ≈ 0.85), edges = background (depth ≈ 0.15)
  // This is the iPhone-style approach: purely geometric, NOT based on pixel color.
  const depthBuffer = new Float32Array(width * height);
  const cx = width * 0.5;
  const cy = height * 0.48; // Slightly above center for typical portrait framing
  const maxRadius = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;

      // Elliptical distance — wider horizontally to match typical subject shape
      const dist = Math.sqrt(dx * dx * 0.7 + dy * dy * 1.0);

      // Smooth falloff from center (foreground) to edges (background)
      // Using a sigmoid-like curve for clean separation
      const t = Math.min(dist / 1.1, 1.0);
      const smoothT = t * t * (3 - 2 * t); // smoothstep

      // Foreground = high depth (0.82), Background = low depth (0.12)
      const baseDepth = 0.82 - smoothT * 0.70;

      depthBuffer[y * width + x] = baseDepth;
    }
  }

  // ── Step 4: Edge-aware refinement ──
  // Where there ARE strong edges in the source image, sharpen the depth transition.
  // Where there are NO edges, keep depth ultra-smooth (solid subject plane).
  // This is subtle — we don't want edges to ADD depth variation, just ALIGN transitions.
  let edgeMax = 0;
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > edgeMax) edgeMax = edges[i];
  }
  if (edgeMax === 0) edgeMax = 1;
  for (let i = 0; i < width * height; i++) {
    const edgeStrength = Math.min(edges[i] / edgeMax, 1.0);
    // Only at strong edges (>0.3), slightly push depth toward background
    // This helps separate subject from background at actual object boundaries
    if (edgeStrength > 0.3) {
      const push = (edgeStrength - 0.3) * 0.15;
      depthBuffer[i] = Math.max(depthBuffer[i] - push, 0.05);
    }
  }

  // ── Step 5: HEAVY multi-pass box blur ──
  // This is critical: we need the depth map to be extremely smooth so the
  // face/subject is treated as ONE SOLID PLANE. No per-pixel jitter.
  let current = depthBuffer;
  let next = new Float32Array(width * height);
  const blurPasses = 4;
  const blurRadius = 8;

  for (let pass = 0; pass < blurPasses; pass++) {
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let kx = -blurRadius; kx <= blurRadius; kx++) {
          const nx = x + kx;
          if (nx >= 0 && nx < width) {
            sum += current[y * width + nx];
            count++;
          }
        }
        next[y * width + x] = sum / count;
      }
    }
    // Swap buffers
    [current, next] = [next, current];

    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let ky = -blurRadius; ky <= blurRadius; ky++) {
          const ny = y + ky;
          if (ny >= 0 && ny < height) {
            sum += current[ny * width + x];
            count++;
          }
        }
        next[y * width + x] = sum / count;
      }
    }
    [current, next] = [next, current];
  }

  // ── Step 6: Render depth map to canvas ──
  const outData = ctx.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    let val = current[i];
    if (invert) val = 1 - val;
    val = Math.min(Math.max(val, 0), 1);
    const byteVal = Math.round(val * 255);
    const p = i * 4;
    outData.data[p] = byteVal;
    outData.data[p + 1] = byteVal;
    outData.data[p + 2] = byteVal;
    outData.data[p + 3] = 255;
  }

  ctx.putImageData(outData, 0, 0);
  return canvas.toDataURL('image/png');
}
