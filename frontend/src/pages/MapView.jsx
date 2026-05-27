import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { Search, Layers, MapPin } from 'lucide-react'

const hotspots = [
  { lat: -0.5, lng: 35.3, radius: 15000, severity: 'high', label: 'Mau Forest', status: 'Critical - Active Clearing' },
  { lat: -1.2, lng: 36.8, radius: 8000, severity: 'medium', label: 'Karura', status: 'Moderate - Under Watch' },
  { lat: 0.2, lng: 37.5, radius: 12000, severity: 'high', label: 'Mt. Kenya', status: 'Critical - Illegal Logging' },
  { lat: -2.5, lng: 38.0, radius: 10000, severity: 'low', label: 'Tsavo East', status: 'Stable - Monitored' },
  { lat: 0.5, lng: 34.8, radius: 9000, severity: 'medium', label: 'Kakamega', status: 'Moderate - Encroachment' },
  { lat: -1.3, lng: 36.7, radius: 6000, severity: 'low', label: 'Ngong Road Forest', status: 'Stable' },
  { lat: -3.4, lng: 39.5, radius: 11000, severity: 'medium', label: 'Arabuko-Sokoke', status: 'Moderate' },
]

const severityColors = { high: '#d14a4a', medium: '#e87474', low: '#6bcf6b' }

export default function MapView() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? hotspots : hotspots.filter(h => h.severity === filter)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-100)' }}>Forest Map View</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 4 }}>Satellite-monitored forest regions across Kenya</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'high', 'medium', 'low'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: filter === s ? (s === 'high' ? 'var(--red-700)' : s === 'medium' ? '#4a2020' : s === 'low' ? 'var(--green-700)' : 'var(--green-700)') : 'var(--card-bg)',
              color: 'var(--text)', border: filter === s ? '1px solid currentColor' : '1px solid var(--border)',
              color: s === 'high' ? 'var(--red-300)' : s === 'medium' ? '#e87474' : 'var(--green-300)',
            }}>
              {s === 'all' ? 'All Zones' : s.charAt(0).toUpperCase() + s.slice(1) + ' Risk'}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)' }}>
          {filtered.length} regions shown
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ height: 560 }}>
          <MapContainer center={[0, 37]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map((h, i) => (
              <CircleMarker key={i} center={[h.lat, h.lng]} radius={h.radius / 2000}
                pathOptions={{ color: severityColors[h.severity], fillColor: severityColors[h.severity], fillOpacity: 0.25, weight: 2 }}>
                <Popup>
                  <div style={{ fontFamily: 'sans-serif', minWidth: 180 }}>
                    <strong style={{ fontSize: 14 }}>{h.label}</strong>
                    <div style={{ fontSize: 12, color: severityColors[h.severity], margin: '4px 0' }}>● {h.status}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Lat: {h.lat} · Lng: {h.lng}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 20 }}>
        {filtered.map((h, i) => (
          <div key={i} style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
            borderLeft: `3px solid ${severityColors[h.severity]}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 4 }}>{h.label}</div>
            <div style={{ fontSize: 12, color: severityColors[h.severity], marginBottom: 2 }}>{h.status}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{h.lat.toFixed(2)}, {h.lng.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
