import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import AnilloCategorias from './AnilloCategorias.jsx'
import { catPago } from '../data/categories.js'

const FRASES = [
  'A ver que trapicheos tenemos hoy 🎉',
  'Vamos a stalkear tu dinero un rato 😎',
  'El dinero no vuela solo, vamos a mirarlo ✨',
  'Otra vez tu por aqui, que majo 🙌',
  'Tu cartera te reclama atencion 💫',
  'Ojo al euro, que no se nos escape ninguno 👌',
  'A cazar bonificaciones se ha dicho 🚀',
  'Vamos a hacer numeros, que da gustito 🎲',
  'Nivel de finanzas: bajo control (esperemos) 🍀'
]

function saludoDelDia() {
  const h = new Date().getHours()
  if (h >= 6 && h < 13) return 'Buenos dias'
  if (h >= 13 && h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function fechaFormateada() {
  const texto = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export default function Dashboard({ irA }) {
  const app = useApp()
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])

  const inicial = app.nombreUsuario.charAt(0).toUpperCase()

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-5">
      <div className="flex items-start gap-3.5">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accentDark flex items-center justify-center text-white font-bold text-xl shrink-0">
          {inicial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-textPrimary leading-tight">{saludoDelDia()}, {app.nombreUsuario}</h1>
          <p className="text-accent font-semibold text-sm mt-0.5">{frase}</p>
          <p className="text-textSecondary text-sm mt-0.5">{fechaFormateada()}</p>
        </div>
      </div>

      <Card className="!rounded-xl3 !shadow-none border border-cardBorder">
        <AnilloCategorias segmentos={app.desgloseCategoriasMes} totalGastado={app.gastoDelMes} />
      </Card>

      {app.pagosComoGastoDelMes > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-textSecondary text-sm">
                <span>💵</span>
                <span>Total salidas este mes</span>
              </div>
              <p className="text-2xl font-bold text-textPrimary mt-1">{app.totalSalidasDelMes.toFixed(2)} €</p>
              <p className="text-[11px] text-textTertiary mt-0.5">
                Gastos {app.gastoDelMes.toFixed(0)}€ + Pagos {app.pagosComoGastoDelMes.toFixed(0)}€
              </p>
            </div>
            <span className="text-3xl text-accent">💳</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <MetricaCard titulo="Ganancia campañas" valor={`${app.gananciaTotalCampanas.toFixed(0)} €`} icono="🎁" color="#34A353" />
        <MetricaCard titulo="Gasto este mes" valor={`${app.gastoDelMes.toFixed(0)} €`} icono="📊" color="#FF7A27" />
        <MetricaCard titulo="Pagos pendientes" valor={String(app.pagosPendientes.length)} icono="⇄" color="#D89214" />
      </div>

      <Card>
        <h3 className="font-bold text-textPrimary mb-2">Proximos pagos</h3>
        {app.pagosPendientes.length === 0 ? (
          <p className="text-sm text-textSecondary py-1.5">No tienes pagos pendientes. Todo al dia.</p>
        ) : (
          <div className="flex flex-col">
            {app.pagosPendientes.slice(0, 4).map((p, i, arr) => {
              const cat = catPago(p.categoria)
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-7 text-center text-lg" style={{ color: cat.color }}>●</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-textPrimary text-sm truncate">{p.concepto}</p>
                      <p className="text-xs text-textSecondary truncate">{p.banco}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-textPrimary text-sm">{Number(p.importe).toFixed(2)} €</p>
                      <p className="text-[11px] text-textTertiary">{new Date(p.fechaLimite).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="border-t border-cardBorder" />}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-textPrimary mb-2">Campañas abiertas</h3>
        {(() => {
          const abiertas = app.campanas.filter(c => c.estado === 'Activa')
          if (abiertas.length === 0) return <p className="text-sm text-textSecondary py-1.5">No tienes campañas abiertas actualmente.</p>
          return (
            <div className="flex flex-col">
              {abiertas.slice(0, 3).map((c, i, arr) => {
                const real = c.tipoIngreso === 'Bruto' ? c.gananciaNeta * 0.81 : c.gananciaNeta
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-semibold text-textPrimary text-sm">{c.banco}</p>
                        <p className="text-xs text-textSecondary">Fin: {new Date(c.finPermanencia).toLocaleDateString('es-ES')}</p>
                      </div>
                      <p className="font-bold text-secondary text-sm">+{real.toFixed(0)} €</p>
                    </div>
                    {i < arr.length - 1 && <div className="border-t border-cardBorder" />}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}

function MetricaCard({ titulo, valor, icono, color }) {
  return (
    <Card className="!p-3.5">
      <span className="text-xl" style={{ color }}>{icono}</span>
      <p className="text-lg font-bold text-textPrimary mt-2">{valor}</p>
      <p className="text-[11px] text-textSecondary mt-0.5 leading-tight">{titulo}</p>
    </Card>
  )
}
