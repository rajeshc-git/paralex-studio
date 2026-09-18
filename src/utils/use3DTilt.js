import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Spring-damped 3D perspective tilt, dynamic depth shadows, and physical glass glare hook
 */
export function use3DTilt({ maxTilt = 9.0, perspective = 1000, scale = 1.025 } = {}) {
  const [transform, setTransform] = useState(
    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  );
  const [boxShadow, setBoxShadow] = useState(
    `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)`
  );
  const [glare, setGlare] = useState({ opacity: 0, x: 50, y: 50 });
  
  const animRef = useRef(null);
  const targetRef = useRef({ rx: 0, ry: 0, s: 1, gx: 50, gy: 50, gOpacity: 0 });
  const currentRef = useRef({ rx: 0, ry: 0, s: 1, gx: 50, gy: 50, gOpacity: 0 });

  const update = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;

    // Smooth physics spring interpolation
    cur.rx += (tgt.rx - cur.rx) * 0.14;
    cur.ry += (tgt.ry - cur.ry) * 0.14;
    cur.s += (tgt.s - cur.s) * 0.14;
    cur.gx += (tgt.gx - cur.gx) * 0.18;
    cur.gy += (tgt.gy - cur.gy) * 0.18;
    cur.gOpacity += (tgt.gOpacity - cur.gOpacity) * 0.18;

    setTransform(
      `perspective(${perspective}px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg) scale3d(${cur.s.toFixed(3)}, ${cur.s.toFixed(3)}, 1)`
    );

    // Dynamic 3D lighting shadow that responds to tilt angle
    const shadowX = (-cur.ry * 2.8).toFixed(1);
    const shadowY = (cur.rx * 2.8 + 25).toFixed(1);
    setBoxShadow(
      `${shadowX}px ${shadowY}px 50px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.18)`
    );

    setGlare({ opacity: cur.gOpacity, x: cur.gx, y: cur.gy });

    const diff =
      Math.abs(tgt.rx - cur.rx) +
      Math.abs(tgt.ry - cur.ry) +
      Math.abs(tgt.gOpacity - cur.gOpacity);

    if (diff > 0.005 || tgt.gOpacity > 0.01) {
      animRef.current = requestAnimationFrame(update);
    } else {
      animRef.current = null;
    }
  }, [perspective]);

  const onPointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return;

      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      const normX = (x - 0.5) * 2;
      const normY = (y - 0.5) * 2;

      targetRef.current = {
        rx: -normY * maxTilt,
        ry: normX * maxTilt,
        s: scale,
        gx: x * 100,
        gy: y * 100,
        gOpacity: 0.35
      };

      if (!animRef.current) {
        animRef.current = requestAnimationFrame(update);
      }
    },
    [maxTilt, scale, update]
  );

  const onPointerLeave = useCallback(() => {
    targetRef.current = { rx: 0, ry: 0, s: 1, gx: 50, gy: 50, gOpacity: 0 };
    if (!animRef.current) {
      animRef.current = requestAnimationFrame(update);
    }
  }, [update]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return {
    transform,
    boxShadow,
    glare,
    onPointerMove,
    onPointerLeave
  };
}
