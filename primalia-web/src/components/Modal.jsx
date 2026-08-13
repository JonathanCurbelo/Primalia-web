import React from 'react'

export default function Modal({ titulo, onClose, onGuardar, guardarTexto = 'Guardar', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card w-full sm:max-w-md sm:rounded-xl2 rounded-t-xl3 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card flex items-center justify-between px-5 py-4 border-b border-cardBorder">
          <button onClick={onClose} className="text-textSecondary font-medium">Cancelar</button>
          <h2 className="font-bold text-textPrimary">{titulo}</h2>
          <button onClick={onGuardar} className="text-accent font-bold">{guardarTexto}</button>
        </div>
        <div className="p-5 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-textSecondary uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

export const inputClass = 'bg-cardElevated border border-cardBorder rounded-xl px-3 py-2.5 text-textPrimary w-full'
