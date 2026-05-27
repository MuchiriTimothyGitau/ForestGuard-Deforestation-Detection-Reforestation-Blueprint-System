# ForestGuard

**Deforestation Detection & Reforestation Blueprint System**

A web application for detecting deforestation in Kenya forests and generating reforestation blueprints. Analyzes satellite imagery, identifies cleared areas, generates CAD-style reforestation layouts with native species recommendations, calculates carbon sequestration projections, and alerts forestry officers.

## Project Structure

```
frontend/    — React + Vite SPA (maps, dashboards, reports)
backend/     — Python FastAPI (API, ML inference, data processing)
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Open http://localhost:5173

## Features

- Real-time deforestation monitoring map
- Satellite-based change detection
- Reforestation blueprint generation
- Carbon sequestration projections
- Native species recommendations
- SMS alert system
- Analytics & reporting

---

*Built with React, Leaflet, Python, FastAPI, and scikit-learn*
