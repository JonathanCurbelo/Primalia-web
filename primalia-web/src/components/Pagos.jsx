import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import Modal, { Field, inputClass } from './Modal.jsx'
import { CATEGORIAS_PAGO, catPago, TIPOS_AVISO, TIPOS_REPETICION } from '../data/categories.js'

const VACIO = {
  banco: '', concepto: '', importe: 0, esHecho: false, categoria: 'otro',
  fechaLimite: new Date().toISOString().slice(0, 10),
  activarAviso: true, antelacionAviso: 'unDia', repeticion: 'Cada mes',
  terminarRepeticionActivo: false, fechaTerminarRepeticion: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  avanceAutomaticoAlMarcarHecho: true
}

export default function Pagos() {
  const app = useApp()
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(VACIO)

  const filtrados = app.pagos.filter(p =>
    p.banco.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.concepto.toLowerCase().includes(busqueda.toLowerCase())
  )
  const agrupados = {}
  filtrados.forEach(p => { (agrupados[p.banco] = agrupados[p.banco] || []).push(p) })
  const bancos = Object.keys(agrupados).sort()

  function abrirNuevo() { setForm(VACIO); setEditandoId(null); setModalAbierto(true) }
  function abrirEditar(p) {
    setForm({
      ...p,
      fechaLimite: p.fechaLimite.slice(0, 10),
      fechaTerminarRepeticion: p.fechaTerminarRepeticion ? p.fechaTerminarRepeticion.slice(0, 10) : VACIO.fechaTerminarRepeticion
    })
    setEditandoId(p.id)
    setModalAbierto(true)
  }
  function guardar() {
    const datos = {
      ...form,
      importe: Number(form.importe) || 0,
      banco: form.banco || 'Banco Principal',
      concepto: form.concepto || 'Pago',
      fechaLimite: new Date(form.fechaLimite).toISOString(),
      fechaTerminarRepeticion: new Date(form.fechaTerminarRepeticion).toISOString()
    }
    if (editandoId) app.actualizarPago(editandoId, datos)
    else app.agregarPago(datos)
    setModalAbierto(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Pagos</h1>
          <p className="text-xs text-textSecondary mt-0.5">{app.pagosPendientes.length} pendientes · {bancos.length} bancos</p>
        </div>
        <button onClick={abrirNuevo} className="w-11 h-11 rounded-full bg-accent text-white text-xl font-bold flex items-center justify-center shadow-card">+</button>
      </div>

      <input className={inputClass} placeholder="Buscar recibos, tarjetas o transferencias..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <div className="flex flex-col gap-4">
        {bancos.map(banco => {
          const lista = agrupados[banco].sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
          const total = lista.reduce((t, p) => t + Number(p.importe), 0)
          return (
            <div key={banco}>
              <p className="text-xs font-bold text-textSecondary uppercase mb-1.5">{banco}</p>
              <Card className="!p-0 divide-y divide-cardBorder overflow-hidden">
                {lista.map(p => {
                  const cat = catPago(p.categoria)
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3">
                      <span className="text-lg shrink-0" style={{ color: cat.color }}>●</span>
                      <button onClick={() => abrirEditar(p)} className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-sm text-textPrimary truncate">{p.concepto}</p>
                        <p className="text-xs text-textSecondary truncate">
                          Cobro: {new Date(p.fechaLimite).toLocaleDateString('es-ES')}
                          {p.repeticion !== 'Nunca' ? ' 🔁' : ''}
                        </p>
                      </button>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          onClick={() => app.alternarHechoPago(p.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.esHecho ? 'bg-secondarySoft text-secondary' : 'bg-amber/15 text-amber'}`}
                        >
                          {p.esHecho ? 'Hecho' : 'Pdte.'}
                        </button>
                        <span className="font-bold text-sm text-danger">-{Number(p.importe).toFixed(2)}€</span>
                      </div>
                      <button onClick={() => app.duplicarPago(p)} className="text-textTertiary text-xs shrink-0">⧉</button>
                      <button onClick={() => app.eliminarPago(p.id)} className="text-danger text-xs shrink-0">✕</button>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between px-3 py-2 bg-cardElevated">
                  <span className="text-sm text-textSecondary">Total Banco</span>
                  <span className="font-bold text-sm text-danger">-{total.toFixed(2)}€</span>
                </div>
              </Card>
            </div>
          )
        })}
        {bancos.length === 0 && <p className="text-center text-sm text-textTertiary py-8">No hay pagos registrados.</p>}
      </div>

      {modalAbierto && (
        <Modal titulo={editandoId ? 'Editar Pago' : 'Nuevo Pago / Recibo'} onClose={() => setModalAbierto(false)} onGuardar={guardar}>
          <Field label="Banco">
            <input className={inputClass} value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <select className={inputClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS_PAGO.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Concepto">
            <input className={inputClass} placeholder="Ej. Alquiler, Tarjeta..." value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} />
          </Field>
          <Field label="Importe (€)">
            <input type="number" step="0.01" className={inputClass} value={form.importe} onChange={e => setForm({ ...form, importe: e.target.value })} />
          </Field>
          <Field label="Estado del Pago">
            <select className={inputClass} value={form.esHecho ? 'hecho' : 'pendiente'} onChange={e => setForm({ ...form, esHecho: e.target.value === 'hecho' })}>
              <option value="pendiente">Pendiente</option>
              <option value="hecho">Hecho</option>
            </select>
          </Field>
          <Field label="Fecha limite de cobro">
            <input type="date" className={inputClass} value={form.fechaLimite} onChange={e => setForm({ ...form, fechaLimite: e.target.value })} />
          </Field>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-textPrimary">Activar aviso recordatorio</span>
            <input type="checkbox" checked={form.activarAviso} onChange={e => setForm({ ...form, activarAviso: e.target.checked })} className="w-5 h-5 accent-accent" />
          </label>
          {form.activarAviso && (
            <Field label="Antelacion del aviso">
              <select className={inputClass} value={form.antelacionAviso} onChange={e => setForm({ ...form, antelacionAviso: e.target.value })}>
                {TIPOS_AVISO.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </Field>
          )}
          <Field label="Repetir">
            <select className={inputClass} value={form.repeticion} onChange={e => setForm({ ...form, repeticion: e.target.value })}>
              {TIPOS_REPETICION.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          {form.repeticion !== 'Nunca' && (
            <>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-textPrimary">Terminar repeticion</span>
                <input type="checkbox" checked={form.terminarRepeticionActivo} onChange={e => setForm({ ...form, terminarRepeticionActivo: e.target.checked })} className="w-5 h-5 accent-accent" />
              </label>
              {form.terminarRepeticionActivo && (
                <Field label="Fecha de finalizacion">
                  <input type="date" className={inputClass} value={form.fechaTerminarRepeticion} onChange={e => setForm({ ...form, fechaTerminarRepeticion: e.target.value })} />
                </Field>
              )}
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-textPrimary">Avance automatico al marcar Hecho</span>
                <input type="checkbox" checked={form.avanceAutomaticoAlMarcarHecho} onChange={e => setForm({ ...form, avanceAutomaticoAlMarcarHecho: e.target.checked })} className="w-5 h-5 accent-accent" />
              </label>
              <p className="text-[11px] text-textTertiary -mt-2">
                Activado: al marcar Hecho, la fila avanza al siguiente cobro. Desactivado: funciona como Hecho/Pendiente simple, reversible.
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
