import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card, Pill } from './Card.jsx'
import Modal, { Field, inputClass } from './Modal.jsx'
import { TIPOS_CUENTA, tipoCuenta } from '../data/categories.js'

const VACIO = {
  banco: '', tipoCuenta: 'corriente', ultimosDigitosIBAN: '',
  fechaApertura: new Date().toISOString().slice(0, 10), beneficiosYProposito: ''
}

export default function Cuentas() {
  const app = useApp()
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(VACIO)

  const filtradas = app.cuentas.filter(c =>
    c.banco.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.beneficiosYProposito || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirNueva() { setForm(VACIO); setEditandoId(null); setModalAbierto(true) }
  function abrirEditar(c) { setForm({ ...c, fechaApertura: c.fechaApertura.slice(0, 10) }); setEditandoId(c.id); setModalAbierto(true) }
  function guardar() {
    const datos = { ...form, banco: form.banco || 'Banco Principal', fechaApertura: new Date(form.fechaApertura).toISOString() }
    if (editandoId) app.actualizarCuenta(editandoId, datos)
    else app.agregarCuenta(datos)
    setModalAbierto(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Cuentas</h1>
          <p className="text-xs text-textSecondary mt-0.5">{app.cuentas.length} cuenta{app.cuentas.length === 1 ? '' : 's'} registrada{app.cuentas.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={abrirNueva} className="w-11 h-11 rounded-full bg-accent text-white text-xl font-bold flex items-center justify-center shadow-card">+</button>
      </div>

      <input className={inputClass} placeholder="Buscar por banco, tipo o beneficios..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">💳</span>
          <p className="font-bold text-textPrimary">No tienes cuentas registradas.</p>
          <p className="text-sm text-textSecondary px-8">Registra tus cuentas bancarias abiertas y sus ventajas exclusivas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(c => {
            const tipo = tipoCuenta(c.tipoCuenta)
            return (
              <Card key={c.id}>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => abrirEditar(c)} className="font-bold text-lg text-textPrimary text-left">{c.banco}</button>
                  <Pill texto={tipo.nombre} color={tipo.color} />
                </div>
                <div className="flex justify-between text-xs text-textSecondary">
                  <span>Apertura: {new Date(c.fechaApertura).toLocaleDateString('es-ES')}</span>
                  {c.ultimosDigitosIBAN && <span>IBAN: •••• {c.ultimosDigitosIBAN}</span>}
                </div>
                {c.beneficiosYProposito && (
                  <>
                    <div className="border-t border-cardBorder my-2" />
                    <p className="text-[11px] font-bold text-textTertiary uppercase mb-1">Beneficios & Proposito</p>
                    <p className="text-sm text-secondary">{c.beneficiosYProposito}</p>
                  </>
                )}
                <div className="flex justify-end mt-2">
                  <button onClick={() => app.eliminarCuenta(c.id)} className="text-xs text-danger font-semibold">Eliminar</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {modalAbierto && (
        <Modal titulo={editandoId ? 'Editar Cuenta' : 'Nueva Cuenta'} onClose={() => setModalAbierto(false)} onGuardar={guardar}>
          <Field label="Nombre del Banco">
            <input className={inputClass} placeholder="Ej. BBVA, Santander" value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} />
          </Field>
          <Field label="Tipo de Cuenta">
            <select className={inputClass} value={form.tipoCuenta} onChange={e => setForm({ ...form, tipoCuenta: e.target.value })}>
              {TIPOS_CUENTA.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Field>
          <Field label="Ultimos 4 digitos IBAN (opcional)">
            <input className={inputClass} maxLength="4" value={form.ultimosDigitosIBAN} onChange={e => setForm({ ...form, ultimosDigitosIBAN: e.target.value })} />
          </Field>
          <Field label="Fecha de Apertura">
            <input type="date" className={inputClass} value={form.fechaApertura} onChange={e => setForm({ ...form, fechaApertura: e.target.value })} />
          </Field>
          <Field label="Beneficios y Motivo de la Cuenta">
            <textarea className={inputClass} rows="3" placeholder="Ej. Remunerada al 3% TAE" value={form.beneficiosYProposito} onChange={e => setForm({ ...form, beneficiosYProposito: e.target.value })} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
