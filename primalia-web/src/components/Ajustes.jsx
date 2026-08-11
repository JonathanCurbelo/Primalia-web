import React, { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import { CATEGORIAS_GASTO } from '../data/categories.js'
import { Bell, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

function IconoFlechaCuadro({ direccion = 'arriba', color = '#FF7A27' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      {direccion === 'arriba' ? (
        <>
          <path d="M12 16V8" />
          <path d="M8.5 11.5 12 8l3.5 3.5" />
        </>
      ) : (
        <>
          <path d="M12 8v8" />
          <path d="M8.5 12.5 12 16l3.5-3.5" />
        </>
      )}
    </svg>
  )
}

function Interruptor({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-12 h-7 rounded-full relative transition-colors duration-200 shrink-0"
      style={{ background: value ? '#FF7A27' : '#E4E0DB' }}
    >
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  )
}

function PantallaNotificaciones({ onVolver, onVerLimites }) {
  const [avisosPagos, setAvisosPagos] = useState(() => localStorage.getItem('primalia_aviso_pagos') !== 'false')
  const [avisosCampanas, setAvisosCampanas] = useState(() => localStorage.getItem('primalia_aviso_campanas') !== 'false')
  const [avisosLimite, setAvisosLimite] = useState(() => localStorage.getItem('primalia_aviso_limite') !== 'false')

  const cambiar = (setter, key) => (val) => { setter(val); localStorage.setItem(key, String(val)) }

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onVolver} className="w-9 h-9 rounded-full bg-cardElevated flex items-center justify-center text-textSecondary">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-textPrimary">Notificaciones</h1>
        </div>

        <Card className="!p-0 divide-y divide-cardBorder overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-accent" />
              <span className="text-sm text-textPrimary">Avisos de Pagos</span>
            </div>
            <Interruptor value={avisosPagos} onChange={cambiar(setAvisosPagos, 'primalia_aviso_pagos')} />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-accent" />
              <span className="text-sm text-textPrimary">Avisos de Campañas</span>
            </div>
            <Interruptor value={avisosCampanas} onChange={cambiar(setAvisosCampanas, 'primalia_aviso_campanas')} />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-accent" />
              <span className="text-sm text-textPrimary">Avisos de Límite de gasto</span>
            </div>
            <Interruptor value={avisosLimite} onChange={cambiar(setAvisosLimite, 'primalia_aviso_limite')} />
          </div>
          <button onClick={onVerLimites} className="w-full flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-accent" />
              <span className="text-sm text-textPrimary">Límites de gasto por categoría</span>
            </div>
            <ChevronRight size={16} className="text-textTertiary" />
          </button>
        </Card>
        <p className="text-[11px] text-textTertiary mt-3 px-1">
          Si apagas un tipo de aviso, dejarás de recibir notificaciones de ese tipo, pero seguirás viendo la información marcada dentro de la app con normalidad (colores, iconos de aviso, etc.).
        </p>
      </div>
    </div>
  )
}

export default function Ajustes({ onClose }) {
  const app = useApp()
  const fileRef = useRef(null)
  const [mensaje, setMensaje] = useState(null)
  const [vista, setVista] = useState('principal')

  function exportar() {
    const blob = new Blob([app.datosParaExportar()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fecha = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `Primalia_copia_${fecha}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importar(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const datos = JSON.parse(reader.result)
        app.restaurar(datos)
        setMensaje({ texto: 'Copia de seguridad importada correctamente.', error: false })
      } catch {
        setMensaje({ texto: 'No se pudo leer el archivo. Asegurate de que es una copia valida.', error: true })
      }
    }
    reader.readAsText(file)
  }

  if (vista === 'notificaciones') {
    return (
      <PantallaNotificaciones
        onVolver={() => setVista('principal')}
        onVerLimites={() => setVista('principal')}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-textPrimary">Ajustes</h1>
          <button onClick={onClose} className="text-accent font-bold">Hecho</button>
        </div>

        <Card className="mb-4">
          <p className="text-xs font-bold text-textSecondary uppercase mb-2">Perfil</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-textPrimary">Nombre</span>
            <input
              className="text-right text-textSecondary bg-transparent outline-none"
              value={app.nombreUsuario}
              onChange={e => app.setNombreUsuario(e.target.value)}
            />
          </div>
        </Card>

        <Card className="mb-4 !p-0">
          <button onClick={() => setVista('notificaciones')} className="w-full flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-accent" />
              <span className="text-sm text-textPrimary">Notificaciones</span>
            </div>
            <ChevronRight size={16} className="text-textTertiary" />
          </button>
        </Card>

        <Card className="mb-4">
          <p className="text-xs font-bold text-textSecondary uppercase mb-3">Limites de gasto por categoria</p>
          <div className="flex flex-col gap-3">
            {CATEGORIAS_GASTO.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm text-textPrimary">{cat.nombre}</span>
                <input
                  type="number"
                  placeholder="—"
                  className="w-20 text-right bg-cardElevated border border-cardBorder rounded-lg px-2 py-1 text-sm"
                  defaultValue={app.limite(cat.id) || ''}
                  onBlur={e => app.establecerLimite(cat.id, Number(e.target.value))}
                />
                <span className="text-sm text-textSecondary">€</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-textTertiary mt-3">Deja vacio para no vigilar esa categoria.</p>
        </Card>

        <Card>
          <p className="text-xs font-bold text-textSecondary uppercase mb-3">Copia de seguridad</p>
          <button onClick={exportar} className="w-full flex items-center gap-3 py-2.5 mb-2.5">
            <IconoFlechaCuadro direccion="arriba" color="#FF7A27" />
            <span className="text-accent font-semibold">Exportar copia de seguridad</span>
          </button>
          <button onClick={() => fileRef.current.click()} className="w-full flex items-center gap-3 py-2.5">
            <IconoFlechaCuadro direccion="abajo" color="#D94438" />
            <span className="text-danger font-semibold">Importar copia de seguridad</span>
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importar} />
          <p className="text-[11px] text-textTertiary mt-3">
            Se incluyen campañas, pagos, cuentas y gastos. El archivo se guarda donde tu elijas.
          </p>
          {mensaje && (
            <p className={`text-sm mt-3 ${mensaje.error ? 'text-danger' : 'text-secondary'}`}>{mensaje.texto}</p>
          )}
        </Card>
      </div>
    </div>
  )
}
