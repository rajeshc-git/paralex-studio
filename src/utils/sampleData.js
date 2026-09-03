/**
 * Ultra High Quality 4K Photographic Presets with Real-Time Neural Depth Map Processing
 */

export const SAMPLE_PRESETS = [
  {
    id: 'lamborghini',
    title: 'Lamborghini Supercar',
    tag: 'Automotive / 4K',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85',
    depth: null // Computed dynamically on load
  },
  {
    id: 'swiss-lake',
    title: 'Switzerland Alpine Lake',
    tag: 'Landscape / Alps',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=85',
    depth: null
  },
  {
    id: 'tokyo-neon',
    title: 'Cyberpunk Tokyo Neon',
    tag: 'Cityscape / Night',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85',
    depth: null
  },
  {
    id: 'studio-portrait',
    title: 'Cinematic Studio Portrait',
    tag: 'Portrait / Studio',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    depth: null
  }
];

export function getSamplePresets() {
  return SAMPLE_PRESETS;
}
