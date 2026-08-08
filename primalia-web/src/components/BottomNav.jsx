import React from 'react'

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'campanas', label: 'Campañas', icon: '🎁' },
  { id: 'pagos', label: 'Pagos', icon: '⇄' },
  { id: 'cuentas', label: 'Cuentas', icon: '💳' },
  { id: 'gastos', label: 'Gastos', icon: '📊' }
]

export default function BottomNav({ activo, onCambiar }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-cardBorder z-40">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onCambiar(tab.id)}
            className="flex flex-col items-center gap-1 px-2 py-1 min-w-[60px]"
          >
            <span className={`text-xl ${activo === tab.id ? '' : 'grayscale opacity-60'}`}>{tab.icon}</span>
            <span className={`text-[11px] font-semibold ${activo === tab.id ? 'text-accent' : 'text-textSecondary'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
