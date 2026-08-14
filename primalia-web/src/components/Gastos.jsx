import { useState, useRef } from 'react';
import { ScanLine, Plus, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Tesseract = window.Tesseract;

export default function Gastos() {
  const { gastos, agregarGasto: agregarGastoCtx, eliminarGasto: eliminarGastoCtx, categorias, limites } = useApp();
  const listaCategorias = categorias || [];
  const [form, setForm] = useState({ fecha: '', importe: '', comercio: '', categoria: '', descripcion: '' });
  const [showModal, setShowModal] = useState(false);
  const [escaneoActivo, setEscaneoActivo] = useState(false);
  const [tabActivo, setTabActivo] = useState('mes');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const mesActual = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  
  // Filtros por período
  const obtenerGastosPorPeriodo = (periodo) => {
    const ahora = new Date();
    return gastos.filter(g => {
      const fecha = new Date(g.fecha);
      if (periodo === 'semana') {
        const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fecha >= hace7Dias;
      } else if (periodo === 'mes') {
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }
      return true;
    });
  };

  const gastosFiltrados = obtenerGastosPorPeriodo(tabActivo);
  const totalFiltrado = gastosFiltrados.reduce((sum, g) => sum + parseFloat(g.importe || 0), 0);
  
  const desgloseFiltrado = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.importe || 0);
    return acc;
  }, {});

  // Detectar categorías que exceden límite
  const categoriasAlerta = Object.entries(desgloseFiltrado).filter(
    ([cat, total]) => limites[cat] && total > limites[cat]
  );

  const parsearTicket = (texto) => {
    if (!texto) return { importe: '', comercio: '', fecha: '' };
    
    // Buscar el total
    let importe = '';
    const totalMatch = texto.match(/(?:TOTAL|Importe)[^0-9]*(\d{1,4}[.,]\d{2})/i);
    if (totalMatch) {
      importe = parseFloat(totalMatch[1].replace(/[.,]/, '.'));
    } else {
      const precioMatches = texto.match(/\d{1,4}[.,]\d{2}/g) || [];
      const preciosValidos = precioMatches
        .map(p => parseFloat(p.replace(/[.,]/, '.')))
        .filter(v => !isNaN(v) && v > 0 && v < 10000);
      importe = preciosValidos.length > 0 ? Math.max(...preciosValidos) : '';
    }
    
    // Comercio: buscar la primera línea sin números, más limpia
    let comercio = '';
    const lineas = texto.split('\n');
    for (const linea of lineas) {
      const limpio = linea.replace(/[\d,.\s€()]/g, '').trim();
      if (limpio.length > 2 && limpio.length < 30) {
        comercio = limpio;
        break;
      }
    }
    
    // Fecha
    let fecha = '';
    const fechaMatch = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (fechaMatch) {
      const [, dia, mes, año] = fechaMatch;
      fecha = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    return { importe, comercio, fecha };
  };

  const abrirCamara = async () => {
    setEscaneoActivo(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      alert('No se pudo acceder a la cámara');
      setEscaneoActivo(false);
    }
  };

  const capturarYProcesar = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imagenURL = canvasRef.current.toDataURL('image/jpeg', 0.8);

    try {
      if (!Tesseract) {
        throw new Error('Tesseract no está cargado todavía, espera unos segundos y vuelve a intentarlo');
      }
      const { data } = await Tesseract.recognize(imagenURL, 'spa');
      const { importe, comercio, fecha } = parsearTicket(data?.text);
      setForm(prev => ({
        ...prev,
        fecha: fecha || '',
        importe: importe !== '' ? String(importe) : '',
        comercio: comercio || ''
      }));
      cerrarEscaneo();
      setShowModal(true);
    } catch (error) {
      alert('Error al procesar imagen: ' + error.message);
      cerrarEscaneo();
    }
  };

  const cerrarEscaneo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setEscaneoActivo(false);
  };

  const agregarGasto = () => {
    if (!form.fecha || !form.importe) {
      alert('Por favor completa fecha e importe');
      return;
    }
    agregarGastoCtx({ ...form });
    setForm({ fecha: '', importe: '', comercio: '', categoria: '', descripcion: '' });
    setShowModal(false);
  };

  const eliminarGasto = (id) => {
    eliminarGastoCtx(id);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Header */}
      <div className="bg-white p-4">
        <h1 className="text-3xl font-bold">Gastos</h1>
        <p className="text-sm text-gray-600">Este Mes · {totalFiltrado.toFixed(2)}€</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto sticky top-0 bg-white">
        <button
          onClick={() => setTabActivo('semana')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition ${
            tabActivo === 'semana'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setTabActivo('mes')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition ${
            tabActivo === 'mes'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Este Mes
        </button>
        <button
          onClick={() => setTabActivo('todo')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition ${
            tabActivo === 'todo'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todo
        </button>
      </div>

      {/* Pantalla de escaneo */}
      {escaneoActivo && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-8 left-0 right-0 flex gap-4 justify-center px-4">
            <button onClick={cerrarEscaneo} className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700">
              Cerrar
            </button>
            <button onClick={capturarYProcesar} className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600">
              Capturar
            </button>
          </div>
          <p className="absolute top-8 text-white text-lg">Leyendo...</p>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tarjeta con círculo de gasto */}
        {totalFiltrado > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Círculo con porcentaje */}
              <div className="flex-shrink-0">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-40 h-40" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeDasharray={`${(100 / 100) * 439.82} 439.82`}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-bold">100%</p>
                    <p className="text-xs text-gray-500">TOTAL GASTADO</p>
                    <p className="text-lg font-semibold">{totalFiltrado.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
              
              {/* Desglose */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-3">GASTO TOTAL ESTE MES</p>
                <div className="space-y-2">
                  {Object.entries(desgloseFiltrado).map(([cat, total]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{cat}</p>
                      </div>
                      <p className="text-sm font-semibold">{total.toFixed(2)} € ({((total / totalFiltrado) * 100).toFixed(0)}%)</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas por límites excedidos */}
        {categoriasAlerta.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">Límites excedidos</p>
                <p className="text-sm text-yellow-700">
                  {categoriasAlerta.map(([cat, total]) => (
                    <span key={cat}>
                      {cat}: {total.toFixed(2)}€ (límite: {limites[cat]}€)
                    </span>
                  )).reduce((prev, curr) => [prev, ', ', curr])}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="flex-1 bg-orange-500 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-orange-600">
            <Plus size={20} /> Añadir manual
          </button>
          <button onClick={abrirCamara} className="flex-1 bg-blue-500 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-blue-600">
            <ScanLine size={20} /> Escanear ticket
          </button>
        </div>

        {/* Últimos gastos */}
        {gastosFiltrados.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">Últimos gastos</h2>
            <div className="space-y-2">
              {[...gastosFiltrados].reverse().slice(0, 5).map(gasto => (
                <div key={gasto.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">🛒</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{gasto.comercio}</p>
                    <p className="text-xs text-gray-600">{gasto.categoria} · {gasto.fecha}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-red-600 text-sm">-{gasto.importe}€</p>
                    <button onClick={() => eliminarGasto(gasto.id)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gastosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay gastos en este período</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-40">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Nuevo Gasto</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Importe (€)</label>
              <input type="number" step="0.01" value={form.importe} onChange={(e) => setForm({ ...form, importe: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Comercio</label>
              <input type="text" value={form.comercio} onChange={(e) => setForm({ ...form, comercio: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3">
                <option value="">Selecciona una categoría</option>
                {listaCategorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" rows="3" />
            </div>

            <button onClick={agregarGasto} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600">
              Agregar Gasto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
