import React, { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import { CATEGORIAS_GASTO } from '../data/categories.js'

export default function Ajustes({ onClose }) {
  const app = useApp()
  const fileRef = useRef(null)
  const [mensaje, setMensaje] = useState(null)

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
          <button onClick={exportar} className="w-full bg-accentSoft text-accent font-semibold rounded-xl py-2.5 mb-2.5">
            Exportar copia de seguridad
          </button>
          <button onClick={() => fileRef.current.click()} className="w-full bg-danger/10 text-danger font-semibold rounded-xl py-2.5">
            Importar copia de seguridad
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
