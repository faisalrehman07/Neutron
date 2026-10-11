# 🧠 NEUTRON — Personal AI Operating System

[![Deploy NEUTRON to GitHub Pages](https://github.com/faisalrehman07/Neutron/actions/workflows/deploy.yml/badge.svg)](https://github.com/faisalrehman07/Neutron/actions/workflows/deploy.yml)

> **Live Web Demo:** [https://faisalrehman07.github.io/Neutron/](https://faisalrehman07.github.io/Neutron/)

NEUTRON is a voice-first, futuristic Personal AI Operating System powered by Gemini Live API, real-time WebGL neural visualization, full cybernetic telemetry HUD, and autonomous tool orchestration.

---

## ✨ Key Capabilities

- 🌐 **Holographic 3D Neural Sphere:** Granular stippled particle core rendered via Three.js custom GLSL shaders with harmonic audio-reactive pulsation and interactive camera parallax.
- ⚡ **Futuristic Cyber HUD:** Real-time clock telemetry (4.2 GHz), quantum coherence indicator, live 24kHz spectral harmonics equalizer, system diagnostics, and synthesized Web Audio sci-fi sound effects.
- 🎙️ **Voice-First Interaction:** Dual-mode audio pipeline supporting real-time 16kHz Gemini Live audio streaming with seamless Web Speech API voice fallback for static environments.
- 🔬 **Adaptive Dual Modes:**
  - **IMMERSIVE:** Holographic neural sphere and cybernetic diagnostics HUD.
  - **RESEARCH:** Deep research workspace with structured findings, citation cards, and client-side context tracking.
- 🛡️ **Autonomous Neural Core & Direct Gemini Client:** Runs locally in the browser or via WebSocket bridge; supports custom client-side Gemini API keys via settings.
- 🛠️ **System Tools & Task Planner:** Calendar scheduling, workspace file search, folder creation, task planning, and contextual memory storage.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/faisalrehman07/Neutron.git
cd Neutron
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development environment
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables (Optional)

Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*Note: When using the static web app on GitHub Pages, you can also enter your Gemini API Key directly under `Settings > API & Live Core`.*

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS v4, Vite 8, Lucide Icons, Motion
- **3D Graphics & Shaders:** Three.js, Custom GLSL shaders
- **Audio & Speech:** Web Audio API, Web Speech API, Custom Synthesizer
- **AI Engine:** Google Gemini Live API (`@google/genai`), Autonomous Client Fallback
- **Deployment:** GitHub Pages & GitHub Actions CI/CD
