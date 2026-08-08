import React, { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import Campanas from './components/Campanas.jsx'
import Pagos from './components/Pagos.jsx'
import Cuentas from './components/Cuentas.jsx'
import Gastos from './components/Gastos.jsx'
import Ajustes from './components/Ajustes.jsx'
import { Settings } from 'lucide-react'
import Bienvenida from './components/Bienvenida.jsx'
import CandadoTransicion from './components/CandadoTransicion.jsx'

function AppShell() {
  const [tab, setTab] = useState('inicio')
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto flex items-center justify-end px-4 pt-3">
        <button
          onClick={() => setAjustesAbiertos(true)}
          className="w-9 h-9 rounded-full bg-cardElevated flex items-center justify-center text-textSecondary"
        >
          <Settings size={18} />
        </button>
      </div>

      {tab === 'inicio' && <Dashboard />}
      {tab === 'campanas' && <Campanas />}
      {tab === 'pagos' && <Pagos />}
      {tab === 'cuentas' && <Cuentas />}
      {tab === 'gastos' && <Gastos />}

      <BottomNav activo={tab} onCambiar={setTab} />
      {ajustesAbiertos && <Ajustes onClose={() => setAjustesAbiertos(false)} />}
    </div>
  )
}

export default function App() {
  const [fase, setFase] = useState('bienvenida')

  return (
    <AppProvider>
      {fase === 'bienvenida' && <Bienvenida onDesbloquear={() => setFase('transicion')} />}
      {fase === 'transicion' && <CandadoTransicion onFinish={() => setFase('app')} />}
      {fase === 'app' && <AppShell />}
    </AppProvider>
  )
}
