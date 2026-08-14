import { useState, useRef } from 'react';
import { ScanLine, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Tesseract = window.Tesseract;

export default function Gastos() {
  const { gastos, agregarGasto: agregarGastoCtx, eliminarGasto: eliminarGastoCtx, categorias } = useApp();
  const listaCategorias = categorias || [];
  const [form, setForm] = useState({ fecha: '', importe: '', comercio: '', categoria: '', descripcion: '' });
  const [showModal, setShowModal] = useState(false);
  const [escaneoActivo, setEscaneoActivo] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const mesActual = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const gastosMes = gastos.filter(g => {
    const fecha = new Date(g.fecha);
    return fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear();
  });
  const totalMes = gastosMes.reduce((sum, g) => sum + parseFloat(g.importe || 0), 0);
  const categoriaDominante = gastosMes.length > 0 && totalMes > 0
    ? Object.entries(gastosMes.reduce((acc, g) => {
        acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.importe || 0);
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]
    : null;

  const parsearTicket = (texto) => {
    if (!texto) return { importe: '', comercio: '', fecha: '' };
    
    // Buscar el total - casos típicos: "TOTAL (€) 12,05" o "Importe: 12,05 €"
    let importe = '';
    const totalMatch = texto.match(/(?:TOTAL|Importe)[^0-9]*(\d{1,4}[.,]\d{2})/i);
    if (totalMatch) {
      importe = parseFloat(totalMatch[1].replace(/[.,]/, '.'));
    } else {
      // Fallback: buscar números con 2 decimales (formato de precio)
      const precioMatches = texto.match(/\d{1,4}[.,]\d{2}/g) || [];
      const preciosValidos = precioMatches
        .map(p => parseFloat(p.replace(/[.,]/, '.')))
        .filter(v => !isNaN(v) && v > 0 && v < 10000);
      importe = preciosValidos.length > 0 ? Math.max(...preciosValidos) : '';
    }
    
    // Comercio: primera línea, sin números
    const primeraLinea = texto.split('\n')[0] || '';
    const comercio = primeraLinea.replace(/[\d,.\s€]/g, '').slice(0, 30) || '';
    
    // Fecha (formato español: DD/MM/YYYY)
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
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-4xl font-bold">Gastos</h1>
        <p className="text-sm opacity-90">{mesActual} · {totalMes.toFixed(2)}€</p>
        {categoriaDominante && (
          <p className="text-orange-100 text-sm mt-2">
            {categoriaDominante[0]} lidera tus gastos con un {((categoriaDominante[1] / totalMes) * 100).toFixed(0)}%
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 p-4 sticky top-0 bg-white shadow-sm z-10">
        <button onClick={() => setShowModal(true)} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-600">
          <Plus size={18} /> Añadir manual
        </button>
        <button onClick={abrirCamara} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600">
          <ScanLine size={18} /> Escanear ticket
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

      {/* Listado de gastos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Desglose por categorías */}
        <div>
          <h2 className="text-xl font-bold mb-3">Desglose por Categorías</h2>
          {totalMes > 0 && Object.entries(
            gastosMes.reduce((acc, g) => {
              acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.importe || 0);
              return acc;
            }, {})
          ).map(([cat, total]) => (
            <div key={cat} className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-600">
                🛒
              </div>
              <div className="flex-1">
                <p className="font-semibold">{cat}</p>
                <p className="text-sm text-gray-600">{((total / totalMes) * 100).toFixed(1)}% del total</p>
              </div>
              <p className="font-bold text-lg">{total.toFixed(2)}€</p>
            </div>
          ))}
          {totalMes === 0 && <p className="text-sm text-gray-500">Todavía no hay gastos este mes.</p>}
        </div>

        {/* Últimos gastos */}
        <div>
          <h2 className="text-xl font-bold mb-3">Ultimos gastos</h2>
          {[...gastos].reverse().slice(0, 5).map(gasto => (
            <div key={gasto.id} className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                🛒
              </div>
              <div className="flex-1">
                <p className="font-semibold">{gasto.comercio}</p>
                <p className="text-sm text-gray-600">{gasto.categoria} · {gasto.fecha}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-red-600">-{gasto.importe}€</p>
                <button onClick={() => eliminarGasto(gasto.id)} className="text-red-600 hover:text-red-800">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
          {gastos.length === 0 && <p className="text-sm text-gray-500">Aún no has añadido ningún gasto.</p>}
        </div>
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
