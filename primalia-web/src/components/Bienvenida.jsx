import React, { useState, useEffect } from 'react'

const FRASES_BOTON = [
  'Aquí empieza todo 🌟',
  'Desbloquéame 🔓',
  '¿Entramos?',
  'No me hagas esperar'
]

function LogoPrimalia({ size = 110, onClick }) {
  return (
    <button onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="gradP1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9A52" />
            <stop offset="100%" stopColor="#FF7A27" />
          </linearGradient>
          <linearGradient id="gradP2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EB5C17" />
            <stop offset="100%" stopColor="#C6470E" />
          </linearGradient>
        </defs>
        <path d="M60 40 C60 40 150 40 150 95 C150 130 120 145 95 145 L95 175 C95 183 88 190 80 190 C72 190 65 183 65 175 L65 60 C65 49 72 40 60 40 Z"
          fill="url(#gradP2)" opacity="0.55" transform="translate(6,10)" />
        <path d="M55 30 C55 30 145 30 145 85 C145 122 113 138 88 138 L88 168 C88 176 81 183 73 183 C65 183 58 176 58 168 L58 50 C58 39 46 30 55 30 Z"
          fill="url(#gradP1)" />
        <circle cx="100" cy="85" r="26" fill="#FAF8F6" />
      </svg>
    </button>
  )
}

function IconoGraficoCircular() {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FDEDE3' }}>
      <svg width="20" height="20" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="#FFD9BA" />
        <path d="M18 18 L18 2 A16 16 0 0 1 32.5 24 Z" fill="#FF7A27" />
      </svg>
    </div>
  )
}

export default function Bienvenida({ onDesbloquear }) {
  const [frase] = useState(() => FRASES_BOTON[Math.floor(Math.random() * FRASES_BOTON.length)])
  const [logoPersonalizado, setLogoPersonalizado] = useState(null)

  // Cargar logo guardado al montar
  useEffect(() => {
    const logoGuardado = localStorage.getItem('logo_primalia_personalizado')
    if (logoGuardado) setLogoPersonalizado(logoGuardado)
  }, [])

  // Manejar selección de archivo
  function manejarSeleccionLogo(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result
      if (base64) {
        localStorage.setItem('logo_primalia_personalizado', base64)
        setLogoPersonalizado(base64)
      }
    }
    reader.readAsDataURL(archivo)
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-bg overflow-hidden">
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #FF7A27, #EA5C17)', top: '-140px' }}
      />
      <div className="relative flex flex-col items-center flex-1 w-full max-w-md px-6 pt-16">
        
        {/* Logo pinchable */}
        <div className="relative">
          {logoPersonalizado ? (
            <button
              onClick={() => document.getElementById('input-logo')?.click()}
              className="cursor-pointer hover:opacity-80 transition-opacity rounded-full overflow-hidden"
            >
              <img src={logoPersonalizado} alt="Logo personalizado" width={130} height={130} className="w-32 h-32 object-cover rounded-full" />
            </button>
          ) : (
            <LogoPrimalia size={130} onClick={() => document.getElementById('input-logo')?.click()} />
          )}
          <input
            id="input-logo"
            type="file"
            accept="image/*"
            onChange={manejarSeleccionLogo}
            className="hidden"
          />
          <p className="text-[10px] text-textTertiary mt-2 text-center">Toca para cambiar</p>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-br from-accent to-accentDark bg-clip-text text-transparent mt-3">
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
            <IconoGraficoCircular />
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
