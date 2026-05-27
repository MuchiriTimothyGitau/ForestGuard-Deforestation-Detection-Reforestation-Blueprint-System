import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { Trees, AlertTriangle, RefreshCw, TrendingDown, Target } from 'lucide-react'
import StatCard from '../components/StatCard'

const hotspots = [
  { lat: -0.5, lng: 35.3, radius: 15000, severity: 'high', label: 'Mau Forest' },
  { lat: -1.2, lng: 36.8, radius: 8000, severity: 'medium', label: 'Karura' },
  { lat: 0.2, lng: 37.5, radius: 12000, severity: 'high', label: 'Mt. Kenya' },
  { lat: -2.5, lng: 38.0, radius: 10000, severity: 'low', label: 'Tsavo' },
  { lat: 0.5, lng: 34.8, radius: 9000, severity: 'medium', label: 'Kakamega' },
]

const severityColors = { high: '#d14a4a', medium: '#e87474', low: '#6bcf6b' }
const monthlyData = [
  { month: 'Jan', loss: 120, reforested: 45 }, { month: 'Feb', loss: 95, reforested: 52 },
  { month: 'Mar', loss: 145, reforested: 38 }, { month: 'Apr', loss: 110, reforested: 60 },
  { month: 'May', loss: 85, reforested: 72 }, { month: 'Jun', loss: 130, reforested: 55 },
  { month: 'Jul', loss: 105, reforested: 65 }, { month: 'Aug', loss: 75, reforested: 80 },
  { month: 'Sep', loss: 90, reforested: 70 }, { month: 'Oct', loss: 115, reforested: 48 },
]

const carbonData = [
  { year: '2020', seq: 1200 }, { year: '2021', seq: 1500 }, { year: '2022', seq: 1800 },
  { year: '2023', seq: 2100 }, { year: '2024', seq: 2800 }, { year: '2025', seq: 3500 },
]

export default function Dashboard() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-100)' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 4 }}>Real-time deforestation monitoring & reforestation tracking</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Trees} label="Forest Cover" value="7,842 km²" color="#3cb043" sub="Kenya protected areas" />
        <StatCard icon={AlertTriangle} label="Deforested (YTD)" value="1,247 ha" color="#d14a4a" sub="↑ 12% from last year" />
        <StatCard icon={RefreshCw} label="Reforested" value="685 ha" color="#6bcf6b" sub="55% recovery rate" />
        <StatCard icon={Target} label="Carbon Sequestered" value="3.5Kt" color="#58a6ff" sub="CO₂ equivalent" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Deforestation Hotspots</h2>
          <div style={{ height: 360, borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer center={[0, 37]} zoom={6} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {hotspots.map((h, i) => (
                <CircleMarker key={i} center={[h.lat, h.lng]} radius={h.radius / 2000} pathOptions={{ color: severityColors[h.severity], fillColor: severityColors[h.severity], fillOpacity: 0.3, weight: 2 }}>
                  <Popup>
                    <div style={{ fontFamily: 'sans-serif' }}><strong>{h.label}</strong><br />Severity: {h.severity}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Monthly Comparison</h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="month" stroke="#8b949e" fontSize={11} />
              <YAxis stroke="#8b949e" fontSize={11} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9' }} />
              <Bar dataKey="loss" fill="#d14a4a" name="Deforested (ha)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reforested" fill="#3cb043" name="Reforested (ha)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Carbon Sequestration Projection</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={carbonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="year" stroke="#8b949e" fontSize={11} />
              <YAxis stroke="#8b949e" fontSize={11} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9' }} />
              <Area type="monotone" dataKey="seq" stroke="#58a6ff" fill="#58a6ff" fillOpacity={0.2} name="CO₂ (tons)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Recent Alerts</h2>
          {[
            { region: 'Mau Forest Complex', time: '2h ago', desc: '2.3 ha cleared detected via satellite' },
            { region: 'Karura Forest', time: '6h ago', desc: 'Suspicious vehicle near north gate' },
            { region: 'Mt. Kenya Forest', time: '1d ago', desc: 'Illegal logging suspected in zone B' },
            { region: 'Kakamega Forest', time: '2d ago', desc: 'Boundary encroachment reported' },
          ].map((a, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-200)' }}>{a.region}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
