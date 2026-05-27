import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

const alerts = [
  { id: 1, region: 'Mau Forest Complex', severity: 'high', msg: 'Deforestation detected — 2.3 ha cleared in the last 48h' },
  { id: 2, region: 'Karura Forest', severity: 'medium', msg: 'Suspicious activity near northern boundary' },
]

const severityColor = {
  high: 'var(--red-400)',
  medium: 'var(--red-300)',
  low: 'var(--green-300)',
}

export default function AlertPanel() {
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(new Set())

  if (!visible) return null

  const active = alerts.filter(a => !dismissed.has(a.id))
  if (active.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      maxWidth: 380, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {active.map(a => (
        <div key={a.id} style={{
          background: a.severity === 'high' ? 'var(--red-900)' : 'var(--gray-800)',
          border: `1px solid ${severityColor[a.severity]}`,
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <AlertTriangle size={18} color={severityColor[a.severity]} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: severityColor[a.severity], marginBottom: 2 }}>{a.region}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-300)' }}>{a.msg}</div>
          </div>
          <button onClick={() => setDismissed(new Set([...dismissed, a.id]))} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', padding: 2 }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
