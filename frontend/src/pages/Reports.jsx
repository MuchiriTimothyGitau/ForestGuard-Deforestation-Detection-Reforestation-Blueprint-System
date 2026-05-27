import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { Download, FileText } from 'lucide-react'

const deforestationData = [
  { region: 'Mau Forest', area: 480, trees: 72000, carbon: 14400 },
  { region: 'Mt. Kenya', area: 320, trees: 48000, carbon: 9600 },
  { region: 'Kakamega', area: 195, trees: 29000, carbon: 5800 },
  { region: 'Karura', area: 85, trees: 13000, carbon: 2600 },
  { region: 'Arabuko-Sokoke', area: 67, trees: 10000, carbon: 2000 },
  { region: 'Tsavo', area: 52, trees: 7800, carbon: 1500 },
]

const speciesData = [
  { name: 'Prunus africana', value: 25 },
  { name: 'Olea capensis', value: 20 },
  { name: 'Vitex keniensis', value: 18 },
  { name: 'Juniperus procera', value: 15 },
  { name: 'Podocarpus spp.', value: 12 },
  { name: 'Brachylaena huillensis', value: 10 },
]

const COLORS = ['#3cb043', '#6bcf6b', '#a3e4a3', '#228b22', '#166616', '#0d2b0d']

export default function Reports() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-100)' }}>Reports & Analytics</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 4 }}>Deforestation impact and reforestation blueprint data</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: 'var(--green-700)', border: '1px solid var(--green-500)', borderRadius: 8,
          color: 'var(--green-200)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>
          <Download size={16} /> Export Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Deforestation by Region (ha)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={deforestationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis type="number" stroke="#8b949e" fontSize={11} />
              <YAxis dataKey="region" type="category" stroke="#8b949e" fontSize={11} width={110} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9' }} />
              <Bar dataKey="area" fill="#d14a4a" name="Area (ha)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)', marginBottom: 16 }}>Native Species Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={speciesData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {speciesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-100)' }}>Reforestation Blueprint Data</h2>
          <FileText size={18} color="var(--gray-400)" />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--gray-700)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--gray-300)', fontWeight: 600 }}>Region</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)', fontWeight: 600 }}>Area (ha)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)', fontWeight: 600 }}>Trees Lost</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)', fontWeight: 600 }}>Carbon Loss (tCO₂)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--gray-300)', fontWeight: 600 }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {deforestationData.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-200)', fontWeight: 500 }}>{d.region}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)' }}>{d.area.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)' }}>{d.trees.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--gray-300)' }}>{d.carbon.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: i < 2 ? 'var(--red-900)' : i < 4 ? '#4a2020' : 'var(--green-900)',
                      color: i < 2 ? 'var(--red-300)' : i < 4 ? '#e87474' : 'var(--green-300)',
                    }}>
                      {i < 2 ? 'Critical' : i < 4 ? 'High' : 'Medium'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
