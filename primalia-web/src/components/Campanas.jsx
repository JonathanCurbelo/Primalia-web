import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card, Pill } from './Card.jsx'
import Modal, { Field, inputClass } from './Modal.jsx'
import { TIPOS_AVISO } from '../data/categories.js'

const VACIO = {
  banco: '', estado: 'Activa', gananciaNeta: 0, tipoIngreso: 'Neto',
  fechaApertura: new Date().toISOString().slice(0, 10),
  finPermanencia: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  activarAviso: true, antelacionAviso: 'dosDias', requisitos: '', notasAdicionales: ''
}

export default function Campanas() {
  const app = useApp()
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(VACIO)

  const filtradas = app.campanas.filter(c =>
    c.banco.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.requisitos || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirNueva() { setForm(VACIO); setEditandoId(null); setModalAbierto(true) }
  function abrirEditar(c) {
    setForm({
      ...c,
      fechaApertura: c.fechaApertura.slice(0, 10),
      finPermanencia: c.finPermanencia.slice(0, 10)
    })
    setEditandoId(c.id)
    setModalAbierto(true)
  }
  function guardar() {
    const datos = {
      ...form,
      gananciaNeta: Number(form.gananciaNeta) || 0,
      fechaApertura: new Date(form.fechaApertura).toISOString(),
      finPermanencia: new Date(form.finPermanencia).toISOString(),
      banco: form.banco || 'Nuevo Banco'
    }
    if (editandoId) app.actualizarCampana(editandoId, datos)
    else app.agregarCampana(datos)
    setModalAbierto(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Campañas</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            {app.campanas.length} campaña{app.campanas.length === 1 ? '' : 's'} · {app.gananciaTotalCampanas.toFixed(2)}€ ganados
          </p>
        </div>
        <button onClick={abrirNueva} className="w-11 h-11 rounded-full bg-accent text-white text-xl font-bold flex items-center justify-center shadow-card">+</button>
      </div>

      <input
        className={inputClass}
        placeholder="Buscar banco o requisitos..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      <Card>
        <p className="text-sm text-textSecondary">Ganancia Total Neta</p>
        <p className="text-3xl font-bold text-secondary mt-1">{app.gananciaTotalCampanas.toFixed(1)}€</p>
      </Card>

      <div className="flex flex-col gap-3">
        {filtradas.map(c => {
          const real = c.tipoIngreso === 'Bruto' ? c.gananciaNeta * 0.81 : c.gananciaNeta
          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => abrirEditar(c)} className="font-bold text-lg text-textPrimary text-left">{c.banco}</button>
                <Pill texto={c.estado} color={c.estado === 'Activa' ? '#34A353' : '#A39D97'} />
              </div>
              <p className="text-sm text-textSecondary">{c.requisitos}</p>
              <div className="border-t border-cardBorder my-2" />
              <div className="flex items-end justify-between">
                <div className="text-xs text-textSecondary">
                  <p>Apertura: {new Date(c.fechaApertura).toLocaleDateString('es-ES')}</p>
                  <p>Fin de campaña: {new Date(c.finPermanencia).toLocaleDateString('es-ES')}</p>
                  {c.notasAdicionales && <p className="italic text-textTertiary mt-1">{c.notasAdicionales}</p>}
                </div>
                <p className="text-xl font-bold text-secondary">+{real.toFixed(1)}€</p>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => app.eliminarCampana(c.id)} className="text-xs text-danger font-semibold">Eliminar</button>
              </div>
            </Card>
          )
        })}
        {filtradas.length === 0 && <p className="text-center text-sm text-textTertiary py-8">No hay campañas.</p>}
      </div>

      {modalAbierto && (
        <Modal titulo={editandoId ? 'Editar Campaña' : 'Nueva Campaña'} onClose={() => setModalAbierto(false)} onGuardar={guardar}>
          <Field label="Nombre del Banco">
            <input className={inputClass} value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} />
          </Field>
          <Field label="Estado">
            <select className={inputClass} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              <option value="Activa">Activa</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </Field>
          <Field label="Cantidad (€)">
            <input type="number" step="0.01" className={inputClass} value={form.gananciaNeta} onChange={e => setForm({ ...form, gananciaNeta: e.target.value })} />
          </Field>
          <Field label="Tipo de Ingreso">
            <select className={inputClass} value={form.tipoIngreso} onChange={e => setForm({ ...form, tipoIngreso: e.target.value })}>
              <option value="Neto">Neto</option>
              <option value="Bruto">Bruto (-19% H.)</option>
            </select>
          </Field>
          <Field label="Fecha Apertura">
            <input type="date" className={inputClass} value={form.fechaApertura} onChange={e => setForm({ ...form, fechaApertura: e.target.value })} />
          </Field>
          <Field label="Fin de campaña">
            <input type="date" className={inputClass} value={form.finPermanencia} onChange={e => setForm({ ...form, finPermanencia: e.target.value })} />
          </Field>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-textPrimary">Activar aviso de fin de campaña</span>
            <input type="checkbox" checked={form.activarAviso} onChange={e => setForm({ ...form, activarAviso: e.target.checked })} className="w-5 h-5 accent-accent" />
          </label>
          {form.activarAviso && (
            <Field label="Antelacion del aviso">
              <select className={inputClass} value={form.antelacionAviso} onChange={e => setForm({ ...form, antelacionAviso: e.target.value })}>
                {TIPOS_AVISO.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </Field>
          )}
          <Field label="Requisitos y Condiciones">
            <input className={inputClass} placeholder="Ej: Domiciliar nomina + 2 recibos" value={form.requisitos} onChange={e => setForm({ ...form, requisitos: e.target.value })} />
          </Field>
          <Field label="Notas Adicionales">
            <textarea className={inputClass} rows="3" value={form.notasAdicionales} onChange={e => setForm({ ...form, notasAdicionales: e.target.value })} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
