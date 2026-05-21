import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clearingEvents } from '@/data/forestData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Mountain,
  CloudRain,
  Target,
  ChevronRight,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import type { ClearingEvent } from '@/types/types';

// NDVI colour palette mapping: 0=bare→brown, 0.5=moderate→yellow, 1=dense→deep green
function ndviToColor(ndvi: number, alpha = 1): string {
  const clamped = Math.max(0, Math.min(1, ndvi));
  if (clamped < 0.2) {
    const t = clamped / 0.2;
    const r = Math.round(180 - t * 60);
    const g = Math.round(120 + t * 40);
    const b = 60;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (clamped < 0.5) {
    const t = (clamped - 0.2) / 0.3;
    const r = Math.round(120 - t * 80);
    const g = Math.round(160 + t * 60);
    const b = 40;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const t = (clamped - 0.5) / 0.5;
  const r = Math.round(40 - t * 15);
  const g = Math.round(220 - t * 80);
  const b = Math.round(100 - t * 80);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Deterministic pseudo-random based on grid position
function seededNoise(row: number, col: number, seed = 0): number {
  const x = Math.sin(row * 31.7 + col * 17.3 + seed * 7.1) * 43758.5;
  return (x - Math.floor(x)) * 0.12 - 0.06;
}

// Draw NDVI scene on a canvas element
function drawNDVICanvas(
  canvas: HTMLCanvasElement,
  baseNdvi: number,
  clearingPercentage: number, // 0=full clearing, 1=no clearing
  label: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  const gridSize = 6;
  const cols = Math.ceil(W / gridSize);
  const rows = Math.ceil(H / gridSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const noise = seededNoise(row, col, clearingPercentage > 0.5 ? 1 : 2);

      const cx = col / cols;
      const cy = row / rows;
      const dx = cx - 0.5;
      const dy = cy - 0.5;
      const distFromCenter = Math.sqrt(dx * dx * 1.4 + dy * dy);
      const inClearingZone = distFromCenter < 0.32;

      let ndvi: number;
      if (inClearingZone) {
        const targetNdvi = 0.12 + seededNoise(row, col, 99) * 0.5 + 0.04;
        ndvi = baseNdvi * clearingPercentage + targetNdvi * (1 - clearingPercentage) + noise;
      } else {
        ndvi = baseNdvi + noise * 0.5;
      }

      ctx.fillStyle = ndviToColor(ndvi);
      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }

  // Year label
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(8, 8, 72, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(label, 14, 26);

  // NDVI scale bar
  const barX = W - 24;
  const barY = 16;
  const barH = H - 32;
  for (let i = 0; i < barH; i++) {
    const v = 1 - i / barH;
    ctx.fillStyle = ndviToColor(v);
    ctx.fillRect(barX, barY + i, 14, 1);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(barX, barY, 14, barH);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '9px system-ui';
  ctx.fillText('1.0', barX - 2, barY + 8);
  ctx.fillText('0.0', barX - 2, barY + barH);
}

// Draw clearing polygon overlay on canvas
function drawPolygonOverlay(
  canvas: HTMLCanvasElement,
  boundary: [number, number][],
  event: ClearingEvent
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || boundary.length < 3) return;

  const W = canvas.width;
  const H = canvas.height;

  // Map lat/lng to canvas coords
  const lats = boundary.map(b => b[0]);
  const lngs = boundary.map(b => b[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (W - 40) + 20;
  const toY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (H - 40) + 20;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'hsl(93,30%,8%)';
  ctx.fillRect(0, 0, W, H);

  // Background NDVI grid (recent)
  const gridSize = 8;
  const cols = Math.ceil(W / gridSize);
  const rows = Math.ceil(H / gridSize);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const noise = seededNoise(row, col, 42);
      const cx = col / cols;
      const cy = row / rows;
      const dx = cx - 0.5;
      const dy = cy - 0.5;
      const dist = Math.sqrt(dx * dx * 1.4 + dy * dy);
      const ndvi = dist < 0.32 ? 0.14 + noise : event.ndviBaseline + noise;
      ctx.fillStyle = ndviToColor(ndvi, 0.9);
      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }

  // Polygon fill
  ctx.beginPath();
  ctx.moveTo(toX(boundary[0][1]), toY(boundary[0][0]));
  for (let i = 1; i < boundary.length; i++) {
    ctx.lineTo(toX(boundary[i][1]), toY(boundary[i][0]));
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(193, 68, 14, 0.25)';
  ctx.fill();
  ctx.setLineDash([6, 3]);
  ctx.strokeStyle = 'rgba(255, 140, 60, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  const centerX = (toX(minLng) + toX(maxLng)) / 2;
  const centerY = (toY(minLat) + toY(maxLat)) / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${event.hectaresLost} ha cleared`, centerX, centerY);
  ctx.textAlign = 'left';

  // Compass
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '11px system-ui';
  ctx.fillText('N↑', W - 22, 18);

  // Scale bar
  const scale = Math.round((maxLng - minLng) * 111000 * 0.25);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, H - 16);
  ctx.lineTo(16 + (W / 4), H - 16);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '9px system-ui';
  ctx.fillText(`~${scale}m`, 16, H - 6);
}

const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = clearingEvents.find(e => e.id === id);

  const canvas2022Ref = useRef<HTMLCanvasElement>(null);
  const canvas2024Ref = useRef<HTMLCanvasElement>(null);
  const polygonCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const drawCanvases = useCallback(() => {
    if (!event) return;
    if (canvas2022Ref.current) {
      drawNDVICanvas(canvas2022Ref.current, event.ndviBaseline, 1.0, '2022 Baseline');
    }
    if (canvas2024Ref.current) {
      drawNDVICanvas(canvas2024Ref.current, event.ndviBaseline, 0.05, '2024 Recent');
    }
    if (polygonCanvasRef.current) {
      drawPolygonOverlay(polygonCanvasRef.current, event.boundary, event);
    }
    setCanvasReady(true);
  }, [event]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  const updateSliderFromEvent = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderFromEvent(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) updateSliderFromEvent(e.clientX);
  }, [isDragging, updateSliderFromEvent]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderFromEvent(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) updateSliderFromEvent(e.touches[0].clientX);
  }, [isDragging, updateSliderFromEvent]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleGenerateBlueprint = async () => {
    if (!event) return;
    setGenerating(true);
    // Simulate AI blueprint generation (in production: calls Claude API via FastAPI)
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false);
    navigate(`/blueprint/${event.id}`);
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-foreground font-medium">Site not found</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="shrink-0 h-8 px-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm text-foreground truncate">{event.name}</h1>
          <p className="text-xs text-muted-foreground truncate">{event.forest} · {event.county} County</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs hidden sm:flex">
          {event.confidenceScore}% confidence
        </Badge>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* NDVI Comparison Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Satellite NDVI Comparison — Drag to Compare
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              NDVI (Normalized Difference Vegetation Index): Green = healthy forest, Brown/Yellow = clearing
            </p>
          </CardHeader>
          <CardContent className="p-0 pb-4 px-4">
            {/* Slider container */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded border border-border select-none touch-none"
              style={{ height: '280px', cursor: 'col-resize' }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* 2024 canvas — full background (recent / deforested) */}
              <div className="absolute inset-0">
                <canvas
                  ref={canvas2024Ref}
                  width={900}
                  height={280}
                  className="w-full h-full"
                  style={{ imageRendering: 'pixelated', display: 'block' }}
                />
              </div>

              {/* 2022 canvas — clipped top layer (baseline / forested) */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <canvas
                  ref={canvas2022Ref}
                  width={900}
                  height={280}
                  className="w-full h-full"
                  style={{ imageRendering: 'pixelated', display: 'block' }}
                />
              </div>

              {/* Divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              />

              {/* Drag handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-white shadow-hover flex items-center justify-center transition-all ${isDragging ? 'shadow-lg scale-110' : ''}`}
                  style={{ border: '3px solid hsl(var(--primary))' }}
                >
                  <span className="text-primary text-base font-bold">⟺</span>
                </div>
              </div>

              {/* Year labels */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded font-bold">2022</span>
              </div>
              <div className="absolute top-3 right-8 pointer-events-none">
                <span className="bg-destructive/80 text-white text-xs px-2 py-1 rounded font-bold">2024</span>
              </div>

              {/* Loading state */}
              {!canvasReady && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* NDVI stats */}
            <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: ndviToColor(event.ndviBaseline) }} />
                <span className="text-muted-foreground">2022 NDVI: <span className="font-semibold text-foreground">{event.ndviBaseline.toFixed(2)}</span></span>
              </div>
              <span className="text-muted-foreground/50">→</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: ndviToColor(event.ndviRecent) }} />
                <span className="text-muted-foreground">2024 NDVI: <span className="font-semibold text-destructive">{event.ndviRecent.toFixed(2)}</span></span>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                Δ {((event.ndviBaseline - event.ndviRecent) * 100 / event.ndviBaseline).toFixed(0)}% vegetation loss
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clearing Boundary Map */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-destructive" />
                Detected Clearing Boundary
              </CardTitle>
              <p className="text-xs text-muted-foreground">CNN-derived polygon from NDVI difference map</p>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
              <div className="rounded border border-border overflow-hidden" style={{ height: '240px' }}>
                <canvas
                  ref={polygonCanvasRef}
                  width={600}
                  height={240}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Site Metadata */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded p-3">
                    <p className="text-2xl font-bold text-destructive">{event.hectaresLost}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Hectares Cleared</p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-2xl font-bold text-primary">{event.confidenceScore}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">AI Confidence</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 py-1.5 border-b border-border">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Coordinates</span>
                    <span className="font-medium text-foreground">{event.lat.toFixed(4)}°, {event.lng.toFixed(4)}°</span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5 border-b border-border">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Detected</span>
                    <span className="font-medium text-foreground">{event.dateDetected}</span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5 border-b border-border">
                    <Mountain className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Altitude</span>
                    <span className="font-medium text-foreground">{event.altitude.toLocaleString()} m asl</span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5 border-b border-border">
                    <CloudRain className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Rainfall</span>
                    <span className="font-medium text-foreground">{event.annualRainfallMm} mm/year</span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Officer</span>
                    <span className="font-medium text-foreground">{event.officerName}</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateBlueprint}
                  disabled={generating}
                  className="w-full h-10 mt-2"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Generating Blueprint...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Generate Blueprint
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {event.blueprintId && (
                  <Button
                    variant="outline"
                    className="w-full h-9"
                    onClick={() => navigate(`/blueprint/${event.id}`)}
                  >
                    View Existing Blueprint
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailPage;
