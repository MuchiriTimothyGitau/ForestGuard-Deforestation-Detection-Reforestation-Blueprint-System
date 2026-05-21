import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { clearingEvents, blueprints, calculateCarbonProjection } from '@/data/forestData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Bell,
  TreePine,
  Ruler,
  Leaf,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

// SVG Blueprint renderer
const BlueprintSVG: React.FC<{ eventId: string }> = ({ eventId }) => {
  const layout = blueprints[Object.keys(blueprints).find(k => blueprints[k].siteId === eventId) || ''];
  if (!layout) return <p className="text-muted-foreground text-sm text-center py-8">Blueprint not found.</p>;

  const W = 580;
  const H = 420;
  const speciesColorMap: Record<string, string> = {};
  layout.species.forEach(s => { speciesColorMap[s.species] = s.color; });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full border border-border rounded"
      style={{
        background: '#ffffff',
        backgroundImage: 'linear-gradient(rgba(45,80,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,80,22,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Title block */}
      <rect x={0} y={0} width={W} height={26} fill="hsl(93,40%,12%)" />
      <text x={12} y={17} fill="white" fontSize={11} fontWeight="bold" fontFamily="monospace">
        REFORESTATION BLUEPRINT · {clearingEvents.find(e => e.id === eventId)?.name?.toUpperCase()} · {layout.generatedAt.split('T')[0]}
      </text>
      <text x={W - 12} y={17} fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="monospace" textAnchor="end">
        IPCC TIER 2 · CLAUDE AI GENERATED
      </text>

      {/* Site boundary polygon (simplified rectangle) */}
      <rect
        x={40} y={46} width={W - 80} height={H - 100}
        fill="none"
        stroke="hsl(16,87%,40%)"
        strokeWidth={2}
        strokeDasharray="8 4"
        rx={2}
      />
      <text x={44} y={60} fill="hsl(16,87%,40%)" fontSize={9} fontFamily="monospace">SITE BOUNDARY · {clearingEvents.find(e => e.id === eventId)?.hectaresLost} ha</text>

      {/* Contour lines */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <path
          key={i}
          d={`M 40,${46 + (H - 100) * t} Q ${W / 2},${46 + (H - 100) * t + (i % 2 === 0 ? 8 : -8)} ${W - 40},${46 + (H - 100) * t}`}
          fill="none"
          stroke="hsl(30,26%,70%)"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      ))}
      <text x={W - 38} y={46 + (H - 100) * 0.25 - 3} fill="hsl(30,26%,50%)" fontSize={8} fontFamily="monospace">2360m</text>
      <text x={W - 38} y={46 + (H - 100) * 0.5 - 3} fill="hsl(30,26%,50%)" fontSize={8} fontFamily="monospace">2340m</text>
      <text x={W - 38} y={46 + (H - 100) * 0.75 - 3} fill="hsl(30,26%,50%)" fontSize={8} fontFamily="monospace">2320m</text>

      {/* Tree rows */}
      {layout.rows.map((row) => {
        const color = speciesColorMap[row.speciesKey] || '#2d5016';
        return (
          <g key={row.rowIndex}>
            {/* Row guide line */}
            <line
              x1={Math.max(40, row.startX)}
              y1={row.startY}
              x2={Math.min(W - 40, row.endX)}
              y2={row.endY}
              stroke={color}
              strokeWidth={0.5}
              strokeOpacity={0.3}
            />
            {/* Tree symbols */}
            {row.treePositions
              .filter(p => p.x > 44 && p.x < W - 44 && p.y > 48 && p.y < H - 50)
              .map((pos, pi) => (
                <g key={pi}>
                  <circle cx={pos.x} cy={pos.y} r={3.5} fill={color} fillOpacity={0.85} />
                  <line x1={pos.x} y1={pos.y - 5} x2={pos.x} y2={pos.y + 5} stroke={color} strokeWidth={0.6} strokeOpacity={0.4} />
                  <line x1={pos.x - 5} y1={pos.y} x2={pos.x + 5} y2={pos.y} stroke={color} strokeWidth={0.6} strokeOpacity={0.4} />
                </g>
              ))}
          </g>
        );
      })}

      {/* Row spacing dimension arrows */}
      {[1, 2].map(i => {
        const y1 = layout.rows[i * 6]?.startY || 100;
        const y2 = layout.rows[i * 6 + 1]?.startY || 115;
        if (!y1 || !y2) return null;
        return (
          <g key={i}>
            <line x1={28} y1={y1} x2={28} y2={y2} stroke="hsl(30,26%,50%)" strokeWidth={1} />
            <line x1={24} y1={y1} x2={32} y2={y1} stroke="hsl(30,26%,50%)" strokeWidth={1} />
            <line x1={24} y1={y2} x2={32} y2={y2} stroke="hsl(30,26%,50%)" strokeWidth={1} />
            <text x={16} y={(y1 + y2) / 2 + 3} fill="hsl(30,26%,40%)" fontSize={7} fontFamily="monospace" textAnchor="middle">
              4m
            </text>
          </g>
        );
      })}

      {/* North arrow */}
      <g transform={`translate(${W - 30}, ${H - 44})`}>
        <circle cx={0} cy={0} r={12} fill="none" stroke="hsl(93,40%,12%)" strokeWidth={1.5} />
        <polygon points="0,-9 4,4 0,1 -4,4" fill="hsl(93,40%,12%)" />
        <text x={0} y={-13} fontSize={8} fontFamily="monospace" textAnchor="middle" fill="hsl(93,40%,12%)">N</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(44, ${H - 26})`}>
        <rect x={0} y={0} width={40} height={6} fill="hsl(93,40%,12%)" />
        <rect x={40} y={0} width={40} height={6} fill="white" stroke="hsl(93,40%,12%)" strokeWidth={1} />
        <text x={0} y={16} fontSize={7} fontFamily="monospace" fill="hsl(93,40%,12%)">0</text>
        <text x={80} y={16} fontSize={7} fontFamily="monospace" fill="hsl(93,40%,12%)">100m</text>
      </g>

      {/* Row angle indicator */}
      <text x={44} y={H - 8} fill="hsl(93,40%,40%)" fontSize={8} fontFamily="monospace">
        ROW ANGLE: {layout.rowAngleDegrees}° · TOTAL TREES: {layout.totalTrees.toLocaleString()}
      </text>
    </svg>
  );
};

const BlueprintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = clearingEvents.find(e => e.id === id);
  const layout = event ? blueprints[Object.keys(blueprints).find(k => blueprints[k].siteId === event.id) || ''] : null;

  const [alertSent, setAlertSent] = useState(false);
  const [alertSending, setAlertSending] = useState(false);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-foreground font-medium">Site not found</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const projection = calculateCarbonProjection(event.hectaresLost, event.id);
  const carbonData = [
    { year: 'Year 5', tonnes: projection.year5, label: `${projection.year5.toLocaleString()} tCO₂` },
    { year: 'Year 10', tonnes: projection.year10, label: `${projection.year10.toLocaleString()} tCO₂` },
    { year: 'Year 20', tonnes: projection.year20, label: `${projection.year20.toLocaleString()} tCO₂` },
  ];
  const chartColors = ['hsl(93,53%,20%)', 'hsl(93,45%,35%)', 'hsl(93,38%,50%)'];

  const handleAlertOfficer = async () => {
    setAlertSending(true);
    // Simulate Africa's Talking SMS API call (production: FastAPI endpoint)
    await new Promise(r => setTimeout(r, 1500));
    setAlertSending(false);
    setAlertSent(true);
    toast.success(`SMS sent to ${event.officerName}`, {
      description: `${event.officerPhone} · ${event.hectaresLost} ha clearing at ${event.name}`,
    });
  };

  const handleDownloadPDF = () => {
    toast.info('Preparing PDF...', { description: 'Blueprint PDF export initiated.' });
    // In production: calls backend /blueprint/{id}/export/pdf
  };

  const handleDownloadDXF = () => {
    toast.info('Preparing DXF...', { description: 'CAD DXF export initiated for AutoCAD/QGIS.' });
    // In production: calls backend /blueprint/{id}/export/dxf
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/site/${event.id}`)} className="shrink-0 h-8 px-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm text-foreground truncate">Reforestation Blueprint · {event.name}</h1>
          <p className="text-xs text-muted-foreground truncate">{layout?.totalTrees.toLocaleString()} trees · {layout?.species.length} species · Claude AI generated</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleDownloadPDF}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleDownloadDXF}>
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DXF</span>
          </Button>
          <Button
            size="sm"
            className={`h-8 gap-1.5 ${alertSent ? 'bg-success' : 'bg-destructive hover:bg-destructive/90'} text-white`}
            onClick={handleAlertOfficer}
            disabled={alertSent || alertSending}
          >
            {alertSent ? (
              <><CheckCircle className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sent</span></>
            ) : alertSending ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span className="hidden sm:inline">Sending…</span></>
            ) : (
              <><Bell className="w-3.5 h-3.5" /><span className="hidden sm:inline">Alert Officer</span></>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Blueprint SVG — 3/5 width */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-primary" />
                  CAD Reforestation Layout
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Generated from GPS boundary, altitude {event.altitude}m, rainfall {event.annualRainfallMm}mm/yr · Open-Meteo + Kenya native species DB
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <BlueprintSVG eventId={event.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right panel — 2/5 width */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Species list */}
            {layout && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    Planting Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {layout.species.map((s) => (
                      <div key={s.species} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.localName}</p>
                            <p className="text-xs text-muted-foreground italic truncate">{s.species}</p>
                          </div>
                          <span className="text-sm font-bold text-foreground shrink-0">{s.percentageShare}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${s.percentageShare}%`, background: s.color }}
                          />
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground pl-5">
                          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{s.spacing}m × {s.rowSpacing}m spacing</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded p-2.5 text-center">
                      <p className="text-lg font-bold text-primary">{layout.totalTrees.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Trees</p>
                    </div>
                    <div className="bg-muted rounded p-2.5 text-center">
                      <p className="text-lg font-bold text-primary">{layout.rowAngleDegrees}°</p>
                      <p className="text-xs text-muted-foreground">Row Angle</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carbon projection chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Carbon Sequestration Projection</CardTitle>
                <p className="text-xs text-muted-foreground">
                  IPCC Tier 2 · BEF 1.74 · {event.hectaresLost} ha · East African highland mixed forest
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="w-full min-w-0 overflow-hidden" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={carbonData} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '4px',
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} tCO₂e`, 'Carbon Sequestered']}
                      />
                      <Bar dataKey="tonnes" radius={[3, 3, 0, 0]}>
                        {carbonData.map((_, index) => (
                          <Cell key={index} fill={chartColors[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {carbonData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: chartColors[i] }} />
                        <span className="text-muted-foreground">{d.year}</span>
                      </div>
                      <span className="font-semibold text-foreground">{d.tonnes.toLocaleString()} tCO₂e</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Officer alert card */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">County Forestry Officer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.officerName} · {event.officerPhone} · {event.county} County
                  </p>
                </div>
                {alertSent ? (
                  <Badge className="bg-success text-white shrink-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    SMS Sent via Africa's Talking
                  </Badge>
                ) : (
                  <div className="text-xs text-muted-foreground shrink-0">
                    SMS will include GPS, area cleared, and blueprint link
                  </div>
                )}
                <Button
                  className={`h-9 shrink-0 ${alertSent ? 'bg-success text-white' : 'bg-destructive text-white hover:bg-destructive/90'}`}
                  onClick={handleAlertOfficer}
                  disabled={alertSent || alertSending}
                >
                  {alertSent ? (
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Officer Alerted</span>
                  ) : alertSending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending SMS…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Bell className="w-4 h-4" />Alert Officer</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlueprintPage;
