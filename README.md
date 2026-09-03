# Paralex 3D — Spatial 3D Photo Studio

Paralex 3D transforms standard 2D photos into high-definition interactive 3D spatial photos with depth maps, gyroscope motion tilting, and export capabilities (.mp4 video with cinematic soundtrack & .gif animations).

![Paralex 3D Studio](https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80)

---

## ✨ Features

- 📱 **Interactive 3D Motion Tilting**: Real-time gyroscope & accelerometer depth perspective across iPhone, iPad, and Desktop.
- 📳 **Haptic Engine Feedback**: Tactile feedback on spatial slider adjustments.
- 💻 **Hardware Bezel Previews**: Ultra-thin MacBook Pro laptop, iPhone, and iPad bezel frames.
- 🎛️ **Futuristic 3D Spatial Sliders**: LED depth ticks with live telemetry for 3D Depth Strength and Focal Point.
- 🎬 **Cinematic Video & GIF Export**: 60fps sequential dual-axis parallax video loops with synthesized ambient soundtrack.
- 🔒 **100% Client-Side Private**: Zero server photo uploads; all WebGL depth computation runs locally in your browser.

---

## 🚀 One-Command Docker Deployment (Production)

Deploy to any Linux VPS / server in seconds:

```bash
# 1. Clone repository
git clone https://github.com/rajeshc-git/paralex-studio.git
cd paralex-studio

# 2. Launch production container (Port 7070)
docker compose up -d --build
```

Access your app at:  
👉 **`http://<your-server-ip>:7070`**

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License & Privacy
- **Privacy**: 100% Client-Side. Photos are never uploaded or stored on any server.
- **License**: MIT
