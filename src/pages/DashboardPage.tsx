import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearingEvents } from '@/data/forestData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TreePine, MapPin, Calendar } from 'lucide-react';
import type { ClearingEvent } from '@/types/types';

// We load Leaflet lazily to avoid SSR issues
let L: typeof import('leaflet') | null = null;

const statusColors: Record<ClearingEvent['status'], string> = {
  detected: 'bg-destructive text-destructive-foreground',
  blueprint_generated: 'bg-primary text-primary-foreground',
  alert_sent: 'bg-warning text-white',
  remediated: 'bg-success text-white',
};

const statusLabels: Record<ClearingEvent['status'], string> = {
  detected: 'Detected',
  blueprint_generated: 'Blueprint Ready',
  alert_sent: 'Officer Alerted',
  remediated: 'Remediated',
};

const DashboardPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const [selectedSite, setSelectedSite] = useState<ClearingEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      // Dynamically import leaflet to ensure CSS loads properly
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      L = leaflet;

      if (!mapRef.current || mapInstanceRef.current || !mounted) return;

      // Fix default icon paths
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Center on Kenya
      const map = leaflet.map(mapRef.current, {
        center: [-0.23, 36.82],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // Tile layer - OpenStreetMap
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Kenya forest zone polygon (approximate Mau Forest Complex boundary)
      const mauForestZone: [number, number][] = [
        [-0.20, 35.38], [-0.20, 36.00],
        [-0.65, 36.10], [-0.70, 35.52],
        [-0.45, 35.38], [-0.20, 35.38],
      ];
      leaflet.polygon(mauForestZone, {
        color: '#2d5016',
        fillColor: '#3d6b20',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map).bindTooltip('Mau Forest Complex', { permanent: false, className: 'leaflet-tooltip' });

      // Aberdare forest zone
      const aberdareZone: [number, number][] = [
        [-0.05, 36.45], [-0.05, 36.85],
        [-0.52, 36.90], [-0.55, 36.48],
        [-0.05, 36.45],
      ];
      leaflet.polygon(aberdareZone, {
        color: '#2d5016',
        fillColor: '#3d6b20',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map).bindTooltip('Aberdare NP', { permanent: false });

      // Mt Kenya forest zone
      const mtKenyaZone: [number, number][] = [
        [0.28, 37.00], [0.35, 37.45],
        [-0.12, 37.60], [-0.18, 37.15],
        [0.28, 37.00],
      ];
      leaflet.polygon(mtKenyaZone, {
        color: '#2d5016',
        fillColor: '#3d6b20',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map).bindTooltip('Mt Kenya Forest Reserve', { permanent: false });

      // Add red markers for each clearing event
      clearingEvents.forEach((event) => {
        // Create SVG-based red circle marker
        const svgMarker = leaflet.divIcon({
          html: `
            <div style="
              width: 20px; height: 20px;
              background: hsl(16, 87%, 40%);
              border: 2.5px solid rgba(255,255,255,0.9);
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              transition: transform 0.2s;
            " title="${event.name}">
              <span style="color:white; font-size:9px; font-weight:bold;">!</span>
            </div>
          `,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = leaflet.marker([event.lat, event.lng], { icon: svgMarker });

        marker.addTo(map);
        marker.bindPopup(`
          <div style="min-width:180px; font-family: system-ui, sans-serif;">
            <p style="font-weight:700; font-size:13px; margin:0 0 4px; color: hsl(93,40%,12%);">${event.name}</p>
            <p style="font-size:11px; color: hsl(93,20%,38%); margin:0 0 8px;">${event.forest}</p>
            <div style="display:flex; gap:12px; font-size:12px;">
              <div><span style="color:hsl(16,87%,40%); font-weight:700;">${event.hectaresLost} ha</span><br/><span style="color:#888;">Lost</span></div>
              <div><span style="font-weight:600;">${event.dateDetected}</span><br/><span style="color:#888;">Detected</span></div>
            </div>
            <p style="margin:8px 0 0; font-size:11px; color:#888;">Click marker to view details</p>
          </div>
        `);

        marker.on('click', () => {
          if (mounted) {
            setSelectedSite(event);
          }
        });
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const totalHectares = clearingEvents.reduce((s, e) => s + e.hectaresLost, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Stats bar */}
      <div className="shrink-0 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-6 flex-wrap">
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <TreePine className="w-4 h-4 text-primary" />
            Kenya Forest Monitor
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />
              <span className="text-muted-foreground">{clearingEvents.length} sites detected</span>
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-destructive">{Math.round(totalHectares)} ha</span> total cleared
            </span>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            May 2026 · Prototype
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Site list panel */}
        <div className="w-72 shrink-0 hidden md:flex flex-col border-r border-border bg-card overflow-y-auto">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-sm font-semibold text-foreground">Clearing Events</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click a site to view details</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {clearingEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setSelectedSite(event);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([event.lat, event.lng], 12);
                  }
                }}
                className={`w-full text-left p-3 rounded border transition-colors cursor-pointer ${
                  selectedSite?.id === event.id
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-foreground text-balance leading-tight">{event.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${statusColors[event.status]}`}>
                    {statusLabels[event.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">{event.forest}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-destructive font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    {event.hectaresLost} ha
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {event.dateDetected}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 min-w-0 relative">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />

          {/* Selected site popup overlay */}
          {selectedSite && (
            <div className="absolute bottom-4 right-4 z-[1000] w-72 max-w-[calc(100%-2rem)]">
              <Card className="shadow-hover border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground text-balance">{selectedSite.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedSite.forest}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSite(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 mt-0.5"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-lg font-bold text-destructive">{selectedSite.hectaresLost}</p>
                      <p className="text-xs text-muted-foreground">Hectares Lost</p>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-lg font-bold text-primary">{selectedSite.confidenceScore}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{selectedSite.lat.toFixed(4)}, {selectedSite.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>Detected: {selectedSite.dateDetected}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">NDVI Change</span>
                      <span className="font-medium text-destructive">
                        {selectedSite.ndviBaseline.toFixed(2)} → {selectedSite.ndviRecent.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${((selectedSite.ndviBaseline - selectedSite.ndviRecent) / selectedSite.ndviBaseline) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(((selectedSite.ndviBaseline - selectedSite.ndviRecent) / selectedSite.ndviBaseline) * 100)}% vegetation loss
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/site/${selectedSite.id}`)}
                    className="w-full h-9 rounded text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    View Site Detail →
                  </button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-3 left-3 z-[1000] bg-card/95 backdrop-blur border border-border rounded p-2.5 text-xs space-y-1.5">
            <p className="font-semibold text-foreground">Legend</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive border border-white/80 shrink-0" />
              <span className="text-muted-foreground">Clearing detected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 border border-dashed border-primary block shrink-0" />
              <span className="text-muted-foreground">Forest zone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
