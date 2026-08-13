import React from 'react'
import { CATEGORIAS_GASTO } from '../data/categories.js'

export default function AnilloCategorias({ segmentos, totalGastado }) {
  const totalSegmentos = segmentos.reduce((t, s) => t + s.total, 0)
  const radio = 58
  const circunferencia = 2 * Math.PI * radio
  let acumulado = 0

  const arcos = segmentos.map(seg => {
    const fraccion = totalSegmentos > 0 ? seg.total / totalSegmentos : 0
    const cat = CATEGORIAS_GASTO.find(c => c.id === seg.categoria)
    const dash = fraccion * circunferencia
    const offset = circunferencia - acumulado * circunferencia
    acumulado += fraccion
    return { color: cat.color, dash, offset }
  })

  const porcentajePrincipal = segmentos.length > 0 && totalSegmentos > 0
    ? Math.round((segmentos[0].total / totalSegmentos) * 100)
    : 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[148px] h-[148px] shrink-0">
        <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
          <circle cx="74" cy="74" r={radio} fill="none" stroke="#ECE7E4" strokeWidth="20" />
          {arcos.map((arco, i) => (
            <circle
              key={i}
              cx="74" cy="74" r={radio} fill="none"
              stroke={arco.color} strokeWidth="20" strokeLinecap="round"
              strokeDasharray={`${arco.dash} ${circunferencia}`}
              strokeDashoffset={arco.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-textPrimary">{segmentos.length === 0 ? '0%' : `${porcentajePrincipal}%`}</span>
          <span className="text-[9px] font-bold text-textTertiary tracking-wide">TOTAL GASTADO</span>
          <span className="text-sm font-bold text-textSecondary">{totalGastado.toFixed(2)} €</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 min-w-0">
        <span className="text-[11px] font-bold text-textSecondary leading-tight">GASTO TOTAL<br />ESTE MES</span>
        {segmentos.length === 0 ? (
          <span className="text-xs text-textTertiary">Sin gastos este mes</span>
        ) : segmentos.slice(0, 4).map(seg => {
          const cat = CATEGORIAS_GASTO.find(c => c.id === seg.categoria)
          const pct = totalSegmentos > 0 ? Math.round((seg.total / totalSegmentos) * 100) : 0
          return (
            <div key={seg.categoria} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-textPrimary truncate">{cat.nombre}</span>
              </div>
              <span className="text-[11px] font-bold text-textSecondary pl-3.5">{seg.total.toFixed(2)} € ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
