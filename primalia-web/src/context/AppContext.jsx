import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CATEGORIAS_GASTO, CATEGORIAS_PAGO, catPago } from '../data/categories.js'

const AppContext = createContext(null)

const LS = {
  campanas: 'primalia_campanas',
  pagos: 'primalia_pagos',
  cuentas: 'primalia_cuentas',
  gastos: 'primalia_gastos',
  limites: 'primalia_limites',
  nombre: 'primalia_nombre',
  foto: 'primalia_foto'
}

function cargar(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function uid() {
  return (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now()
}

function esMismoMes(fechaISO) {
  if (!fechaISO) return false
  const f = new Date(fechaISO)
  const ahora = new Date()
  return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth()
}

function siguienteFecha(fechaISO, repeticion) {
  const f = new Date(fechaISO)
  switch (repeticion) {
    case 'Cada dia': f.setDate(f.getDate() + 1); return f.toISOString()
    case 'Cada semana': f.setDate(f.getDate() + 7); return f.toISOString()
    case 'Cada 2 semanas': f.setDate(f.getDate() + 14); return f.toISOString()
    case 'Cada mes': f.setMonth(f.getMonth() + 1); return f.toISOString()
    case 'Cada año': f.setFullYear(f.getFullYear() + 1); return f.toISOString()
    default: return null
  }
}

export function AppProvider({ children }) {
  const [campanas, setCampanas] = useState(() => cargar(LS.campanas, []))
  const [pagos, setPagos] = useState(() => cargar(LS.pagos, []))
  const [cuentas, setCuentas] = useState(() => cargar(LS.cuentas, []))
  const [gastos, setGastos] = useState(() => cargar(LS.gastos, []))
  const [limites, setLimites] = useState(() => cargar(LS.limites, {}))
  const [nombreUsuario, setNombreUsuario] = useState(() => localStorage.getItem(LS.nombre) || 'Jonny')
  const [fotoPerfil, setFotoPerfil] = useState(() => localStorage.getItem(LS.foto) || null)

  useEffect(() => { localStorage.setItem(LS.campanas, JSON.stringify(campanas)) }, [campanas])
  useEffect(() => { localStorage.setItem(LS.pagos, JSON.stringify(pagos)) }, [pagos])
  useEffect(() => { localStorage.setItem(LS.cuentas, JSON.stringify(cuentas)) }, [cuentas])
  useEffect(() => { localStorage.setItem(LS.gastos, JSON.stringify(gastos)) }, [gastos])
  useEffect(() => { localStorage.setItem(LS.limites, JSON.stringify(limites)) }, [limites])
  useEffect(() => { localStorage.setItem(LS.nombre, nombreUsuario) }, [nombreUsuario])
  useEffect(() => {
    if (fotoPerfil) localStorage.setItem(LS.foto, fotoPerfil)
    else localStorage.removeItem(LS.foto)
  }, [fotoPerfil])

  function agregarCampana(c) {
    setCampanas(prev => [...prev, {
      id: uid(), estado: 'Activa', tipoIngreso: 'Neto', activarAviso: true,
      antelacionAviso: 'dosDias', notasAdicionales: '', requisitos: '', ...c
    }])
  }
  function actualizarCampana(id, cambios) { setCampanas(prev => prev.map(c => c.id === id ? { ...c, ...cambios } : c)) }
  function eliminarCampana(id) { setCampanas(prev => prev.filter(c => c.id !== id)) }

  function agregarPago(p) {
    setPagos(prev => [...prev, {
      id: uid(), esHecho: false, categoria: 'otro', activarAviso: true, antelacionAviso: 'unDia',
      repeticion: 'Cada mes', terminarRepeticionActivo: false, fechaTerminarRepeticion: null,
      avanceAutomaticoAlMarcarHecho: true, fechaMarcadoHecho: p.esHecho ? new Date().toISOString() : null, ...p
    }])
  }
  function actualizarPago(id, cambios) {
    setPagos(prev => prev.map(p => {
      if (p.id !== id) return p
      const actualizado = { ...p, ...cambios }
      if ('esHecho' in cambios && cambios.esHecho !== p.esHecho) {
        actualizado.fechaMarcadoHecho = cambios.esHecho ? new Date().toISOString() : null
      }
      return actualizado
    }))
  }
  function eliminarPago(id) { setPagos(prev => prev.filter(p => p.id !== id)) }
  function duplicarPago(pago) { setPagos(prev => [...prev, { ...pago, id: uid(), esHecho: false, fechaMarcadoHecho: null }]) }

  function alternarHechoPago(id) {
    setPagos(prev => prev.map(p => {
      if (p.id !== id) return p
      const puedeAvanzar = p.avanceAutomaticoAlMarcarHecho && !p.esHecho && p.repeticion !== 'Nunca' && p.repeticion !== 'Personalizado'
      if (puedeAvanzar) {
        const siguiente = siguienteFecha(p.fechaLimite, p.repeticion)
        const superaFin = p.terminarRepeticionActivo && p.fechaTerminarRepeticion && siguiente && new Date(siguiente) > new Date(p.fechaTerminarRepeticion)
        if (siguiente && !superaFin) {
          return { ...p, fechaLimite: siguiente, fechaMarcadoHecho: new Date().toISOString() }
        }
      }
      const nuevoEstado = !p.esHecho
      return { ...p, esHecho: nuevoEstado, fechaMarcadoHecho: nuevoEstado ? new Date().toISOString() : null }
    }))
  }

  function agregarCuenta(c) {
    setCuentas(prev => [...prev, { id: uid(), tipoCuenta: 'corriente', ultimosDigitosIBAN: '', beneficiosYProposito: '', ...c }])
  }
  function actualizarCuenta(id, cambios) { setCuentas(prev => prev.map(c => c.id === id ? { ...c, ...cambios } : c)) }
  function eliminarCuenta(id) { setCuentas(prev => prev.filter(c => c.id !== id)) }

  function agregarGasto(g) { setGastos(prev => [...prev, { id: uid(), categoria: 'otros', ...g }]) }
  function eliminarGasto(id) { setGastos(prev => prev.filter(g => g.id !== id)) }

  function establecerLimite(categoriaId, valor) {
    setLimites(prev => {
      const copia = { ...prev }
      if (valor && valor > 0) copia[categoriaId] = valor
      else delete copia[categoriaId]
      return copia
    })
  }

  const gananciaTotalCampanas = useMemo(
    () => campanas.reduce((tot, c) => tot + (c.tipoIngreso === 'Bruto' ? (c.gananciaNeta || 0) * 0.81 : (c.gananciaNeta || 0)), 0),
    [campanas]
  )

  const pagosPendientes = useMemo(
    () => pagos.filter(p => !p.esHecho).sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite)),
    [pagos]
  )

  const gastoDelMes = useMemo(
    () => gastos.filter(g => esMismoMes(g.fecha)).reduce((t, g) => t + Number(g.importe || 0), 0),
    [gastos]
  )

  const desgloseCategoriasMes = useMemo(() => {
    const acumulado = {}
    gastos.filter(g => esMismoMes(g.fecha)).forEach(g => {
      acumulado[g.categoria] = (acumulado[g.categoria] || 0) + Number(g.importe || 0)
    })
    return Object.entries(acumulado)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
  }, [gastos])

  const pagosComoGastoDelMes = useMemo(() => {
    return pagos
      .filter(p => p.esHecho && catPago(p.categoria).cuentaComoGasto && p.fechaMarcadoHecho && esMismoMes(p.fechaMarcadoHecho))
      .reduce((t, p) => t + Number(p.importe || 0), 0)
  }, [pagos])

  const totalSalidasDelMes = gastoDelMes + pagosComoGastoDelMes

  function limite(categoriaId) { return limites[categoriaId] }

  const categoriasConLimiteSuperado = useMemo(
    () => desgloseCategoriasMes.filter(seg => limites[seg.categoria] && seg.total > limites[seg.categoria]),
    [desgloseCategoriasMes, limites]
  )

  function fraseGastosContextual() {
    if (categoriasConLimiteSuperado.length > 0) {
      const seg = categoriasConLimiteSuperado[0]
      const cat = CATEGORIAS_GASTO.find(c => c.id === seg.categoria)
      return `¡Cuidado! ${cat.nombre} ya paso tu limite de ${Math.round(limites[seg.categoria])}€`
    }
    if (desgloseCategoriasMes.length === 0) return ''
    const principal = desgloseCategoriasMes[0]
    const cat = CATEGORIAS_GASTO.find(c => c.id === principal.categoria)
    const total = desgloseCategoriasMes.reduce((t, s) => t + s.total, 0)
    const pct = total > 0 ? Math.round((principal.total / total) * 100) : 0
    return `${cat.nombre} lidera tus gastos con un ${pct}%`
  }

  function datosParaExportar() {
    return JSON.stringify({ campanas, pagos, cuentas, gastos, limites, fechaExportacion: new Date().toISOString() }, null, 2)
  }

  function restaurar(objeto) {
    if (!objeto) return false
    if (objeto.campanas) setCampanas(objeto.campanas)
    if (objeto.pagos) setPagos(objeto.pagos)
    if (objeto.cuentas) setCuentas(objeto.cuentas)
    if (objeto.gastos) setGastos(objeto.gastos)
    if (objeto.limites) setLimites(objeto.limites)
    return true
  }

  const value = {
    campanas, pagos, cuentas, gastos, limites, nombreUsuario, setNombreUsuario, fotoPerfil, setFotoPerfil,
    agregarCampana, actualizarCampana, eliminarCampana,
    agregarPago, actualizarPago, eliminarPago, duplicarPago, alternarHechoPago,
    agregarCuenta, actualizarCuenta, eliminarCuenta,
    agregarGasto, eliminarGasto,
    establecerLimite, limite, categoriasConLimiteSuperado,
    gananciaTotalCampanas, pagosPendientes, gastoDelMes, desgloseCategoriasMes,
    pagosComoGastoDelMes, totalSalidasDelMes, fraseGastosContextual,
    datosParaExportar, restaurar, esMismoMes
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
