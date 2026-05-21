import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts';
import { clearingEvents, getAggregateReport, calculateCarbonProjection } from '@/data/forestData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TreePine,
  AlertTriangle,
  FileText,
  TrendingUp,
  Globe,
  Leaf,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  detected: 'bg-destructive/20 text-destructive border-destructive/30',
  blueprint_generated: 'bg-primary/20 text-primary border-primary/30',
  alert_sent: 'bg-warning/20 text-foreground border-warning/30',
  remediated: 'bg-success/20 text-success border-success/30',
};
const statusLabels: Record<string, string> = {
  detected: 'Detected',
  blueprint_generated: 'Blueprint Ready',
  alert_sent: 'Officer Alerted',
  remediated: 'Remediated',
};

const CarbonReportPage: React.FC = () => {
  const report = getAggregateReport();

  // Per-site carbon data for bar chart
  const siteCarbonData = clearingEvents.map(e => {
    const p = calculateCarbonProjection(e.hectaresLost, e.id);
    return {
      name: e.name.replace(' Block 4', '').replace(' Escarpment', '').replace(' North Sector', '').replace(' Western Buffer', '').replace(' NE Corridor', ''),
      shortName: e.name.split(' ').slice(0, 2).join(' '),
      hectares: e.hectaresLost,
      year5: p.year5,
      year10: p.year10,
      year20: p.year20,
    };
  });

  // Timeline projection line chart
  const timelineData = [
    { year: 'Yr 1', total: 0 },
    { year: 'Yr 3', total: Math.round(report.projectedCarbonYear5 * 0.35) },
    { year: 'Yr 5', total: report.projectedCarbonYear5 },
    { year: 'Yr 8', total: Math.round(report.projectedCarbonYear10 * 0.72) },
    { year: 'Yr 10', total: report.projectedCarbonYear10 },
    { year: 'Yr 15', total: Math.round((report.projectedCarbonYear10 + report.projectedCarbonYear20) / 2) },
    { year: 'Yr 20', total: report.projectedCarbonYear20 },
  ];

  const kpiCards = [
    {
      label: 'Sites Detected',
      value: report.sitesDetected,
      unit: 'locations',
      icon: AlertTriangle,
      iconClass: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Total Cleared',
      value: report.totalHectares.toLocaleString(),
      unit: 'hectares',
      icon: Globe,
      iconClass: 'text-foreground',
      bg: 'bg-muted',
    },
    {
      label: 'Blueprints Generated',
      value: report.blueprintsGenerated,
      unit: 'plans ready',
      icon: FileText,
      iconClass: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Carbon at Year 5',
      value: `${(report.projectedCarbonYear5 / 1000).toFixed(1)}k`,
      unit: 'tCO₂e sequestered',
      icon: Leaf,
      iconClass: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Carbon at Year 10',
      value: `${(report.projectedCarbonYear10 / 1000).toFixed(1)}k`,
      unit: 'tCO₂e sequestered',
      icon: TrendingUp,
      iconClass: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Carbon at Year 20',
      value: `${(report.projectedCarbonYear20 / 1000).toFixed(1)}k`,
      unit: 'tCO₂e sequestered',
      icon: TreePine,
      iconClass: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2 text-balance">
              <BarChart3 className="w-5 h-5 text-primary" />
              Carbon Sequestration Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Aggregate projection across all {report.sitesDetected} detected deforestation sites in Kenya
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">IPCC Tier 2 Methodology</Badge>
            <Badge variant="outline" className="text-xs">BEF 1.74 · RSR 0.27</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="h-full flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground text-balance">{kpi.label}</p>
                    <div className={`p-1.5 rounded ${kpi.bg} shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${kpi.iconClass}`} />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground mt-auto">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carbon per site bar chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Carbon Projection by Site</CardTitle>
              <p className="text-xs text-muted-foreground text-pretty">If all sites are replanted with native species blueprints</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={siteCarbonData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
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
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} tCO₂e`]}
                    />
                    <Legend
                      layout="horizontal"
                      wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="year5" name="Year 5" fill="hsl(93,53%,20%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="year10" name="Year 10" fill="hsl(93,45%,35%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="year20" name="Year 20" fill="hsl(93,38%,50%)" radius={[2, 2, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Carbon timeline line chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cumulative Carbon Timeline</CardTitle>
              <p className="text-xs text-muted-foreground text-pretty">Total CO₂e sequestered across all sites if replanting begins now</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} tCO₂e`, 'Cumulative CO₂e']}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total CO₂e"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sites table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Detected Sites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {['Site', 'Forest', 'County', 'Hectares', 'Detected', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-xs font-semibold text-muted-foreground text-left px-4 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clearingEvents.map((e) => {
                    const p = calculateCarbonProjection(e.hectaresLost, e.id);
                    return (
                      <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{e.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{e.forest}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{e.county}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-destructive whitespace-nowrap">{e.hectaresLost}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{e.dateDetected}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[e.status]}`}>
                            {statusLabels[e.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            to={`/site/${e.id}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-foreground">TOTAL</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-destructive">{report.totalHectares}</td>
                    <td colSpan={3} className="px-4 py-2.5 text-xs text-muted-foreground">
                      {report.sitesDetected} sites · {report.blueprintsGenerated} blueprints · Yr20 potential: {report.projectedCarbonYear20.toLocaleString()} tCO₂e
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Methodology note */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Methodology</p>
            <p className="text-xs text-muted-foreground text-pretty leading-relaxed">
              Carbon projections use IPCC Good Practice Guidance Tier 2 methodology for tropical moist forests.
              Biomass Expansion Factor (BEF): 1.74 · Root-to-Shoot Ratio (RSR): 0.27 · Carbon Fraction (CF): 0.47 ·
              Mean Annual Increment (MAI): 6.2 tC/ha/yr for East African highland mixed forests.
              A sigmoid growth curve accounts for establishment lag (years 1–3) and canopy closure.
              Species mix follows Claude AI recommendations based on Open-Meteo rainfall data and Kenya Forest Service native species database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarbonReportPage;
