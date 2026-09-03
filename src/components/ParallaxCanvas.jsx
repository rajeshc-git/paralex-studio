import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

const ParallaxShader = {
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
    uniform float uShowDepth;
    uniform vec2 uResolution;
    uniform vec2 uImageAspect;
    varying vec2 vUv;

    void main() {
      // Calculate aspect-ratio COVER texture coordinates
      vec2 st = vUv;
      float screenAspect = uResolution.x / uResolution.y;
      float imgAspect = uImageAspect.x / uImageAspect.y;

      vec2 uvFit = st;
      if (screenAspect > imgAspect) {
        // Screen is wider than image -> fit width, crop top/bottom symmetrically
        float ratio = imgAspect / screenAspect;
        uvFit.y = (st.y - 0.5) * ratio + 0.5;
      } else {
        // Screen is taller than image -> fit height, crop left/right symmetrically
        float ratio = screenAspect / imgAspect;
        uvFit.x = (st.x - 0.5) * ratio + 0.5;
      }

      // Safe overscan zoom to eliminate border clamping stretch
      vec2 centeredUv = (uvFit - 0.5) * (1.0 - uOverscan) + 0.5;

      // Sample depth map
      vec4 depthColor = texture2D(uDepthMap, centeredUv);
      float rawDepth = depthColor.r;
      if (uInvert > 0.5) {
        rawDepth = 1.0 - rawDepth;
      }

      // If in depth map debug mode, output grayscale depth
      if (uShowDepth > 0.5) {
        gl_FragColor = vec4(vec3(rawDepth), 1.0);
        return;
      }

      // Center around focal plane
      float depthOffset = rawDepth - uFocus;

      // Parallax displacement
      vec2 parallax = uMouse * depthOffset * uIntensity;
      vec2 sampleUv = clamp(centeredUv + parallax, 0.001, 0.999);

      gl_FragColor = texture2D(uImage, sampleUv);
    }
  `
};

const ParallaxCanvas = forwardRef(function ParallaxCanvas(
  {
    imageSrc,
    depthSrc,
    intensity = 0.05,
    focusPlane = 0.5,
    overscan = 0.08,
    autoWiggle = true,
    showDepth = false,
    invertDepth = false,
    useGyro = true,
    className = ''
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
  const animFrameRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, override: false });
  const timeRef = useRef(0);
  const gyroGrantedRef = useRef(false);
  const baseOrientationRef = useRef({ beta: null, gamma: null });

  // Expose canvas and control hooks to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    setOverrideCoords: (x, y) => {
      mouse.current.override = true;
      mouse.current.targetX = x;
      mouse.current.targetY = y;
      mouse.current.x = x;
      mouse.current.y = y;
    },
    releaseOverrideCoords: () => {
      mouse.current.override = false;
    }
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Clear previous elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    canvasRef.current = renderer.domElement;
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // Determine actual pixel dimensions of image
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = imageSrc;
    tempImg.onload = () => {
      if (materialRef.current && tempImg.width > 0 && tempImg.height > 0) {
        materialRef.current.uniforms.uImageAspect.value.set(tempImg.width, tempImg.height);
      }
    };

    let imgTexture = textureLoader.load(imageSrc, (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (materialRef.current && tex.image) {
        materialRef.current.uniforms.uImageAspect.value.set(
          tex.image.width || 800,
          tex.image.height || 1000
        );
      }
    });

    let depthTexture = textureLoader.load(depthSrc, (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const material = new THREE.ShaderMaterial({
      vertexShader: ParallaxShader.vertexShader,
      fragmentShader: ParallaxShader.fragmentShader,
      uniforms: {
        uImage: { value: imgTexture },
        uDepthMap: { value: depthTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: intensity },
        uFocus: { value: focusPlane },
        uOverscan: { value: overscan },
        uInvert: { value: invertDepth ? 1.0 : 0.0 },
        uShowDepth: { value: showDepth ? 1.0 : 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uImageAspect: { value: new THREE.Vector2(800, 1000) }
      }
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation Render Loop
    let lastTime = performance.now();
    const render = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeRef.current += dt;

      if (materialRef.current) {
        mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.12;
        mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.12;
        materialRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          renderer.setSize(newW, newH);
          if (materialRef.current) {
            materialRef.current.uniforms.uResolution.value.set(newW, newH);
          }
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      imgTexture.dispose();
      depthTexture.dispose();
      renderer.dispose();
    };
  }, [imageSrc, depthSrc]);

  // Update dynamic uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uFocus.value = focusPlane;
      materialRef.current.uniforms.uOverscan.value = overscan;
      materialRef.current.uniforms.uShowDepth.value = showDepth ? 1.0 : 0.0;
      materialRef.current.uniforms.uInvert.value = invertDepth ? 1.0 : 0.0;
    }
  }, [intensity, focusPlane, overscan, showDepth, invertDepth]);

  // Pointer move handlers
  const handlePointerMove = (e) => {
    if (mouse.current.override) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;

    mouse.current.targetX = Math.max(-1, Math.min(1, x));
    mouse.current.targetY = Math.max(-1, Math.min(1, y));
  };

  const handlePointerLeave = () => {
    if (mouse.current.override) return;
    mouse.current.targetX = 0;
    mouse.current.targetY = 0;
  };

  // Device orientation / Gyroscope
  useEffect(() => {
    if (!useGyro) return;

    const handleDeviceOrientation = (event) => {
      if (mouse.current.override) return;
      if (event.gamma !== null && event.beta !== null) {
        // Calibrate relative to initial holding angle
        if (baseOrientationRef.current.beta === null) {
          baseOrientationRef.current.beta = event.beta;
          baseOrientationRef.current.gamma = event.gamma;
        }

        // Gentle adaptive drift so changing posture naturally recenters
        baseOrientationRef.current.beta += (event.beta - baseOrientationRef.current.beta) * 0.003;
        baseOrientationRef.current.gamma += (event.gamma - baseOrientationRef.current.gamma) * 0.003;

        const deltaGamma = event.gamma - baseOrientationRef.current.gamma;
        const deltaBeta = event.beta - baseOrientationRef.current.beta;

        // High-sensitivity mapping for both Horizontal and Vertical axes
        const tiltX = Math.max(-1.5, Math.min(1.5, deltaGamma / 10));
        const tiltY = Math.max(-1.5, Math.min(1.5, deltaBeta / 8));

        mouse.current.targetX = tiltX;
        mouse.current.targetY = tiltY;
      }
    };

    const attachGyro = () => {
      if (!gyroGrantedRef.current) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        gyroGrantedRef.current = true;
      }
    };

    // Check if iOS permission is needed
    const needsPermission =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function';

    if (needsPermission) {
      // Try checking if already granted (silent check)
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') attachGyro();
        })
        .catch(() => {});

      // Listen for the global permission-granted event from App.jsx
      const onGlobalGrant = () => attachGyro();
      window.addEventListener('gyro-permission-granted', onGlobalGrant);

      return () => {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        window.removeEventListener('gyro-permission-granted', onGlobalGrant);
      };
    } else {
      // Android / desktop — just listen directly
      attachGyro();
      return () => {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      };
    }
  }, [useGyro]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'grab',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    />
  );
});

export default ParallaxCanvas;

