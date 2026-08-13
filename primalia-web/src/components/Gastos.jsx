import React, { useMemo, useState, useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card } from './Card.jsx'
import Modal, { Field, inputClass } from './Modal.jsx'
import AnilloCategorias from './AnilloCategorias.jsx'
import { Trash2, Plus, ScanLine, X } from 'lucide-react'
import { CATEGORIAS_GASTO, catGasto } from '../data/categories.js'
import { CategoriaIcon } from '../data/icons.jsx'
import Tesseract from 'tesseract.js'

const PERIODOS = ['Esta Semana', 'Este Mes', 'Todo']
const VACIO = { comercio: '', importe: 0, fecha: new Date().toISOString().slice(0, 10), categoria: 'otros' }

function enMismaSemana(fechaISO) {
  const f = new Date(fechaISO); const ahora = new Date()
  const inicioSemana = new Date(ahora)
  const dia = (ahora.getDay() + 6) % 7
  inicioSemana.setDate(ahora.getDate() - dia)
  inicioSemana.setHours(0, 0, 0, 0)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 7)
  return f >= inicioSemana && f < finSemana
}

function enMismoMes(fechaISO) {
  const f = new Date(fechaISO); const ahora = new Date()
  return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth()
}

// Función para parsear texto OCR y extraer datos
function parsearTicket(texto) {
  const lineas = texto.split('\n').filter(l => l.trim())
  
  // Buscar número que parezca importe (con € o decimal)
  const importeRegex = /[\d,]+\.?\d{1,2}\s*€?|\$[\d,.]+/gi
  const importes = texto.match(importeRegex) || []
  let importe = 0
  
  if (importes.length > 0) {
    const ultimoImporte = importes[importes.length - 1].replace(/[€$\s]/g, '').replace(',', '.')
    importe = Math.max(...importes.map(i => parseFloat(i.replace(/[€$\s]/g, '').replace(',', '.'))))
  }

  // Buscar nombre de comercio (primera línea larga o palabras capitalizadas)
  let comercio = ''
  for (const linea of lineas) {
    if (linea.length > 3 && linea.length < 50 && /[A-Za-z]/.test(linea)) {
      comercio = linea.trim()
      break
    }
  }

  return { comercio, importe: importe || 0 }
}

export default function Gastos() {
  const app = useApp()
  const [periodo, setPeriodo] = useState('Este Mes')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [escaneoActivo, setEscaneoActivo] = useState(false)
  const [procesandoOCR, setProcesandoOCR] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const filtrados = useMemo(() => {
    if (periodo === 'Esta Semana') return app.gastos.filter(g => enMismaSemana(g.fecha))
    if (periodo === 'Este Mes') return app.gastos.filter(g => enMismoMes(g.fecha))
    return app.gastos
  }, [app.gastos, periodo])

  const ordenados = [...filtrados].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const totalGastado = filtrados.reduce((t, g) => t + Number(g.importe || 0), 0)

  const segmentos = useMemo(() => {
    const acumulado = {}
    filtrados.forEach(g => { acumulado[g.categoria] = (acumulado[g.categoria] || 0) + Number(g.importe || 0) })
    return Object.entries(acumulado).map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total)
  }, [filtrados])

  function abrirNuevo() { setForm(VACIO); setModalAbierto(true) }
  function guardar() {
    if (Number(form.importe) <= 0) return
    app.agregarGasto({
      comercio: form.comercio || 'Gasto',
      importe: Number(form.importe),
      fecha: new Date(form.fecha).toISOString(),
      categoria: form.categoria
    })
    setModalAbierto(false)
  }

  // Abrir cámara para escaneo
  async function abrirCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setEscaneoActivo(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      alert('No se pudo acceder a la cámara. Asegúrate de haber dado permisos.')
    }
  }

  // Capturar foto y procesarla con OCR
  async function capturarYProcesar() {
    if (!videoRef.current || !canvasRef.current) return
    
    setProcesandoOCR(true)
    try {
      const context = canvasRef.current.getContext('2d')
      const video = videoRef.current
      canvasRef.current.width = video.videoWidth
      canvasRef.current.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      const imagenURL = canvasRef.current.toDataURL('image/jpeg')
      
      // Procesar con Tesseract
      const resultado = await Tesseract.recognize(imagenURL, 'spa')
      const texto = resultado.data.text
      
      const datosExtraidos = parsearTicket(texto)
      
      // Rellenar formulario con datos extraídos
      setForm({
        ...VACIO,
        comercio: datosExtraidos.comercio,
        importe: datosExtraidos.importe
      })
      
      // Cerrar cámara
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
      setEscaneoActivo(false)
      setModalAbierto(true)
    } catch (err) {
      alert('Error al procesar imagen: ' + err.message)
    } finally {
      setProcesandoOCR(false)
    }
  }

  // Cerrar escaneo
  function cerrarEscaneo() {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setEscaneoActivo(false)
  }

  const frase = app.fraseGastosContextual()

  if (escaneoActivo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="flex-1 object-cover w-full"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="bg-black/80 text-white p-4 flex gap-3">
          <button
            onClick={cerrarEscaneo}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-full py-3 font-bold flex items-center justify-center gap-2"
          >
            <X size={18} /> Cerrar
          </button>
          <button
            onClick={capturarYProcesar}
            disabled={procesandoOCR}
            className="flex-1 bg-accent hover:bg-accentDark rounded-full py-3 font-bold disabled:opacity-50"
          >
            {procesandoOCR ? 'Leyendo...' : 'Capturar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Gastos</h1>
        <p className="text-xs text-textSecondary mt-0.5">{periodo} · {totalGastado.toFixed(2)}€</p>
      </div>

      {frase && (
        <div className={`text-sm font-semibold px-3 py-2 rounded-xl ${app.categoriasConLimiteSuperado.length > 0 ? 'bg-danger/10 text-danger' : 'text-accent'}`}>
          {frase}
        </div>
      )}

      <div className="flex bg-cardElevated rounded-xl p-1">
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg ${periodo === p ? 'bg-card shadow-card text-textPrimary' : 'text-textSecondary'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <Card>
        <AnilloCategorias segmentos={segmentos} totalGastado={totalGastado} />
      </Card>

      <div className="flex gap-3">
        <button onClick={abrirNuevo} className="flex-1 bg-accent text-white font-bold rounded-full py-3 flex items-center justify-center gap-2">
          <Plus size={18} /> Añadir manual
        </button>
        <button onClick={abrirCamara} className="flex-1 bg-accent/10 text-accent font-bold rounded-full py-3 flex items-center justify-center gap-2">
          <ScanLine size={18} /> Escanear ticket
        </button>
      </div>

      <div>
        <h3 className="font-bold text-textPrimary mb-2">Desglose por Categorias</h3>
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS_GASTO.map(cat => {
            const seg = segmentos.find(s => s.categoria === cat.id)
            if (!seg || seg.total <= 0) return null
            const pct = totalGastado > 0 ? (seg.total / totalGastado) * 100 : 0
            const lim = app.limite(cat.id)
            const supera = periodo === 'Este Mes' && lim && seg.total > lim
            return (
              <Card key={cat.id} className="!p-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: (supera ? '#D94438' : cat.color) + '29', color: supera ? '#D94438' : cat.color }}>
                    <CategoriaIcon icono={cat.icono} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className={`text-sm font-semibold ${supera ? 'text-danger' : 'text-textPrimary'}`}>{cat.nombre}</span>
                      <span className={`text-sm font-bold ${supera ? 'text-danger' : 'text-textPrimary'}`}>{seg.total.toFixed(2)} €</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cardBorder mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: supera ? '#D94438' : cat.color }} />
                    </div>
                    <span className="text-[11px] text-textTertiary">
                      {supera ? `${seg.total.toFixed(2)}€ gastados / limite ${lim.toFixed(0)}€` : `${pct.toFixed(1)}% del total`}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-textPrimary mb-2">Ultimos gastos</h3>
        {ordenados.length === 0 ? (
          <p className="text-center text-sm text-textTertiary py-8">No hay gastos registrados en este periodo.</p>
        ) : (
          <Card className="!p-0 divide-y divide-cardBorder overflow-hidden">
            {ordenados.slice(0, 50).map(g => {
              const cat = catGasto(g.categoria)
              return (
                <div key={g.id} className="flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '29', color: cat.color }}>
                    <CategoriaIcon icono={cat.icono} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-textPrimary truncate">{g.comercio}</p>
                    <p className="text-xs text-textSecondary">{cat.nombre} · {new Date(g.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className="font-bold text-sm text-danger shrink-0">-{Number(g.importe).toFixed(2)} €</span>
                  <button onClick={() => app.eliminarGasto(g.id)} className="text-danger shrink-0"><Trash2 size={16} /></button>
                </div>
              )
            })}
          </Card>
        )}
      </div>

      {modalAbierto && (
        <Modal titulo="Nuevo Gasto" onClose={() => setModalAbierto(false)} onGuardar={guardar}>
          <Field label="Comercio o concepto">
            <input className={inputClass} placeholder="Ej. Mercadona, Netflix..." value={form.comercio} onChange={e => setForm({ ...form, comercio: e.target.value })} />
          </Field>
          <Field label="Importe (€)">
            <input
