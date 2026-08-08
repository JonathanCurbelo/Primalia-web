import React, { useEffect, useState } from 'react'

export default function CandadoTransicion({ onFinish }) {
  const [abierto, setAbierto] = useState(false)
  const [destellos, setDestellos] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setAbierto(true), 400)
    const t2 = setTimeout(() => setDestellos(true), 550)
    const t3 = setTimeout(() => onFinish(), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#38393B' }}>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div
          className="absolute w-60 h-60 rounded-full blur-3xl transition-opacity duration-500"
          style={{ background: 'radial-gradient(circle, #FF7A27 0%, transparent 70%)', opacity: abierto ? 0.4 : 0 }}
        />

        <div
          className="absolute w-14 h-16 border-[13px] border-b-0 rounded-t-full transition-all duration-500 ease-out"
          style={{
            borderColor: '#FF7A27',
            top: abierto ? '-4px' : '6px',
            left: abierto ? '58px' : '43px',
            transform: abierto ? 'rotate(35deg)' : 'rotate(0deg)',
            transformOrigin: 'bottom left'
          }}
        />

        <div
          className="absolute w-24 h-20 rounded-2xl shadow-xl flex items-center justify-center transition-transform duration-500"
          style={{
            background: 'linear-gradient(135deg, #FF7A27, #EA5C17)',
            transform: abierto ? 'scale(1.08) rotate(6deg)' : 'scale(1)'
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#28282A' }}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFC79E' }} />
          </div>
        </div>

        {destellos && (
          <>
            <span className="absolute text-white text-lg animate-ping" style={{ top: '10px', left: '-10px' }}>✦</span>
            <span className="absolute text-accent text-2xl animate-ping" style={{ bottom: '0px', left: '-24px' }}>✦</span>
            <span className="absolute text-white text-sm animate-ping" style={{ top: '-10px', right: '-14px' }}>✦</span>
          </>
        )}
      </div>
    </div>
  )
}
