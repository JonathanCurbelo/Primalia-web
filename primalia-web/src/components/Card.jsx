import React from 'react'

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card rounded-xl2 shadow-card p-4 ${className}`}>
      {children}
    </div>
  )
}

export function Pill({ texto, color }) {
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: color + '29', color }}
    >
      {texto}
    </span>
  )
}
