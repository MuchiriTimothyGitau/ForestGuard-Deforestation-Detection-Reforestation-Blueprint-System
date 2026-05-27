import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import Reports from './pages/Reports'
import AlertPanel from './components/AlertPanel'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
      <AlertPanel />
    </div>
  )
}
