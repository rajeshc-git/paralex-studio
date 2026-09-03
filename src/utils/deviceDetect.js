/**
 * Automatic Device & Viewport Detector
 */

export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const ua = navigator.userAgent || '';

  const isMobileUA = /iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile/i.test(ua);
  const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(ua);

  if (isMobileUA || w <= 640) {
    return 'mobile';
  } else if (isTabletUA || (w > 640 && w <= 1024)) {
    return 'tablet';
  }
  return 'desktop';
}
