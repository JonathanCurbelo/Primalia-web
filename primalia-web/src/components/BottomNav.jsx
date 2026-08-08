import React from 'react'
import { Home, Gift, ArrowLeftRight, CreditCard, PieChart } from 'lucide-react'

const TABS = [
  { id: 'inicio', label: 'Inicio', Icono: Home },
  { id: 'campanas', label: 'Campañas', Icono: Gift },
  { id: 'pagos', label: 'Pagos', Icono: ArrowLeftRight },
  { id: 'cuentas', label: 'Cuentas', Icono: CreditCard },
  { id: 'gastos', label: 'Gastos', Icono: PieChart }
]

export default function BottomNav({ activo, onCambiar }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-cardBorder z-40">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {TABS.map(({ id, label, Icono }) => (
          <button
            key={id}
            onClick={() => onCambiar(id)}
            className="flex flex-col items-center justify-center gap-1 px-2 py-1.5 min-w-[60px]"
          >
            <Icono size={22} strokeWidth={2.2} color={activo === id ? '#FF7A27' : '#A39D97'} />
            <span className={`text-[11px] font-semibold leading-none ${activo === id ? 'text-accent' : 'text-textSecondary'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
