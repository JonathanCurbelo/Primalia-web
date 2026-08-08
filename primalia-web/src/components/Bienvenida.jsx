import React, { useState } from 'react'

const FRASES_BOTON = [
  'Aquí empieza todo 🌟',
  'Desbloquéame 🔓',
  '¿Entramos?',
  'No me hagas esperar'
]

export default function Bienvenida({ onDesbloquear }) {
  const [frase] = useState(() => FRASES_BOTON[Math.floor(Math.random() * FRASES_BOTON.length)])

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-bg overflow-hidden">
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #FF7A27, #EA5C17)', top: '-140px' }}
      />

      <div className="relative flex flex-col items-center flex-1 w-full max-w-md px-6 pt-20">
        <div className="w-[110px] h-[110px] rounded-3xl bg-gradient-to-br from-accent to-accentDark flex items-center justify-center shadow-card mb-5">
          <span className="text-white font-bold text-4xl">P</span>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-br from-accent to-accentDark bg-clip-text text-transparent">
          Primalia
        </h1>
        <p className="text-sm text-textSecondary text-center mt-2 px-6">
          Gestión inteligente de bonificaciones, pagos y gastos.
        </p>

        <div className="w-full bg-card rounded-xl2 shadow-card p-4 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <span>🛡</span> Panel Seguro
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="text-[11px] font-bold text-secondary">Activo</span>
            </div>
          </div>
          <div className="border-t border-cardBorder my-3" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-textSecondary">Campañas & Cuentas</p>
              <p className="font-bold text-textPrimary">Control Total</p>
            </div>
            <span className="text-2xl text-accent">📊</span>
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={onDesbloquear}
          className="w-full bg-gradient-to-br from-accent to-accentDark text-white font-bold rounded-full py-4 flex items-center justify-center gap-3 shadow-card mb-9"
        >
          <span className="text-xl">🔓</span>
          <span>{frase}</span>
        </button>
      </div>
    </div>
  )
}
