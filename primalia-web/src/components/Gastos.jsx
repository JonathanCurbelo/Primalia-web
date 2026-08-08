import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import Modal, { Field, inputClass } from './Modal.jsx'
import AnilloCategorias from './AnilloCategorias.jsx'
import { Trash2, Plus } from 'lucide-react'
import { CATEGORIAS_GASTO, catGasto } from '../data/categories.js'
import { CategoriaIcon } from '../data/icons.jsx'

const PERIODOS = ['Esta Semana', 'Este Mes', 'Todo']

const VACIO = { comercio: '', importe: 0, fecha: new Date().toISOString().slice(0, 10), categoria: 'otros' }

function enMismaSemana(fechaISO) {
  const f = new Date(fechaISO); const ahora = new Date()
  const inicioSemana = new Date(ahora)
  const dia = (ahora.getDay() + 6) % 7
  inicioSemana.setDate(ahora.getDate() - dia)
  inicioSemana.setHours(0, 0, 0, 0)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 7)
  return f >= inicioSemana && f < finSemana
}

function enMismoMes(fechaISO) {
  const f = new Date(fechaISO); const ahora = new Date()
  return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth()
}

export default function Gastos() {
  const app = useApp()
  const [periodo, setPeriodo] = useState('Este Mes')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(VACIO)

  const filtrados = useMemo(() => {
    if (periodo === 'Esta Semana') return app.gastos.filter(g => enMismaSemana(g.fecha))
    if (periodo === 'Este Mes') return app.gastos.filter(g => enMismoMes(g.fecha))
    return app.gastos
  }, [app.gastos, periodo])

  const ordenados = [...filtrados].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const totalGastado = filtrados.reduce((t, g) => t + Number(g.importe || 0), 0)

  const segmentos = useMemo(() => {
    const acumulado = {}
    filtrados.forEach(g => { acumulado[g.categoria] = (acumulado[g.categoria] || 0) + Number(g.importe || 0) })
    return Object.entries(acumulado).map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total)
  }, [filtrados])

  function abrirNuevo() { setForm(VACIO); setModalAbierto(true) }
  function guardar() {
    if (Number(form.importe) <= 0) return
    app.agregarGasto({
      comercio: form.comercio || 'Gasto',
      importe: Number(form.importe),
      fecha: new Date(form.fecha).toISOString(),
      categoria: form.categoria
    })
    setModalAbierto(false)
  }

  const frase = app.fraseGastosContextual()

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Gastos</h1>
        <p className="text-xs text-textSecondary mt-0.5">{periodo} · {totalGastado.toFixed(2)}€</p>
      </div>

      {frase && (
        <div className={`text-sm font-semibold px-3 py-2 rounded-xl ${app.categoriasConLimiteSuperado.length > 0 ? 'bg-danger/10 text-danger' : 'text-accent'}`}>
          {frase}
        </div>
      )}

      <div className="flex bg-cardElevated rounded-xl p-1">
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg ${periodo === p ? 'bg-card shadow-card text-textPrimary' : 'text-textSecondary'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <Card>
        <AnilloCategorias segmentos={segmentos} totalGastado={totalGastado} />
      </Card>

      <button onClick={abrirNuevo} className="bg-accent text-white font-bold rounded-full py-3 flex items-center justify-center gap-2">
        <Plus size={18} /> Añadir gasto manual
      </button>

      <div>
        <h3 className="font-bold text-textPrimary mb-2">Desglose por Categorias</h3>
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS_GASTO.map(cat => {
            const seg = segmentos.find(s => s.categoria === cat.id)
            if (!seg || seg.total <= 0) return null
            const pct = totalGastado > 0 ? (seg.total / totalGastado) * 100 : 0
            const lim = app.limite(cat.id)
            const supera = periodo === 'Este Mes' && lim && seg.total > lim
            return (
              <Card key={cat.id} className="!p-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: (supera ? '#D94438' : cat.color) + '29', color: supera ? '#D94438' : cat.color }}>
                    <CategoriaIcon icono={cat.icono} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className={`text-sm font-semibold ${supera ? 'text-danger' : 'text-textPrimary'}`}>{cat.nombre}</span>
                      <span className={`text-sm font-bold ${supera ? 'text-danger' : 'text-textPrimary'}`}>{seg.total.toFixed(2)} €</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cardBorder mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: supera ? '#D94438' : cat.color }} />
                    </div>
                    <span className="text-[11px] text-textTertiary">
                      {supera ? `${seg.total.toFixed(2)}€ gastados / limite ${lim.toFixed(0)}€` : `${pct.toFixed(1)}% del total`}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-textPrimary mb-2">Ultimos gastos</h3>
        {ordenados.length === 0 ? (
          <p className="text-center text-sm text-textTertiary py-8">No hay gastos registrados en este periodo.</p>
        ) : (
          <Card className="!p-0 divide-y divide-cardBorder overflow-hidden">
            {ordenados.slice(0, 50).map(g => {
              const cat = catGasto(g.categoria)
              return (
                <div key={g.id} className="flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '29', color: cat.color }}>
                    <CategoriaIcon icono={cat.icono} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-textPrimary truncate">{g.comercio}</p>
                    <p className="text-xs text-textSecondary">{cat.nombre} · {new Date(g.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className="font-bold text-sm text-danger shrink-0">-{Number(g.importe).toFixed(2)} €</span>
                  <button onClick={() => app.eliminarGasto(g.id)} className="text-danger shrink-0"><Trash2 size={16} /></button>
                </div>
              )
            })}
          </Card>
        )}
      </div>

      {modalAbierto && (
        <Modal titulo="Nuevo Gasto" onClose={() => setModalAbierto(false)} onGuardar={guardar}>
          <Field label="Comercio o concepto">
            <input className={inputClass} placeholder="Ej. Mercadona, Netflix..." value={form.comercio} onChange={e => setForm({ ...form, comercio: e.target.value })} />
          </Field>
          <Field label="Importe (€)">
            <input type="number" step="0.01" className={inputClass} value={form.importe} onChange={e => setForm({ ...form, importe: e.target.value })} />
          </Field>
          <Field label="Fecha">
            <input type="date" className={inputClass} value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS_GASTO.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, categoria: cat.id })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${form.categoria === cat.id ? 'border-accent bg-accentSoft text-accent font-semibold' : 'border-cardBorder text-textPrimary'}`}
                >
                  <CategoriaIcon icono={cat.icono} size={16} />{cat.nombre}
                </button>
              ))}
            </div>
          </Field>
        </Modal>
      )}
    </div>
  )
}
