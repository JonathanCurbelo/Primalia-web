import { useState } from 'react';
import { ChevronRight, Download, Upload, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Ajustes() {
  const { nombreUsuario, setNombreUsuario, fotoPerfil, setFotoPerfil, limites, establecerLimite, categorias, datosParaExportar, restaurar } = useApp();
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState(nombreUsuario);
  const [expandirNotificaciones, setExpandirNotificaciones] = useState(false);
  const [expandirLimites, setExpandirLimites] = useState(false);

  const cambiarFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFotoPerfil(evt.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarNombre = () => {
    setNombreUsuario(nombreTemp);
    setEditandoNombre(false);
  };

  const exportar = () => {
    const datos = datosParaExportar();
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `primalia-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const datos = JSON.parse(evt.target?.result);
          if (restaurar(datos)) {
            alert('Copia de seguridad restaurada correctamente');
          } else {
            alert('El archivo no es válido');
          }
        } catch {
          alert('Error al leer el archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 to-white pb-20">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Ajustes</h1>
          <span className="text-orange-500 font-semibold text-sm">Hecho</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        {/* PERFIL */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase mb-4">Perfil</h2>
            
            {/* Foto */}
            <div className="mb-6 flex flex-col items-center">
              <label className="cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {fotoPerfil ? (
                    <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    'P'
                  )}
                </div>
                <input type="file" accept="image/*" onChange={cambiarFoto} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">Toca para cambiar</p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre</label>
              {editandoNombre ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nombreTemp}
                    onChange={(e) => setNombreTemp(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-3"
                    autoFocus
                  />
                  <button onClick={guardarNombre} className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600">
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{nombreUsuario}</p>
                  <button onClick={() => setEditandoNombre(true)} className="text-orange-500 hover:text-orange-600">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NOTIFICACIONES Y LÍMITES */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase mb-4">Notificaciones</h2>
            
            {/* Toggle Notificaciones */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Avisos de Pagos</span>
                <input type="checkbox" defaultChecked className="w-6 h-6 accent-orange-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Avisos de Campañas</span>
                <input type="checkbox" defaultChecked className="w-6 h-6 accent-orange-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Avisos de Límite de gasto</span>
                <input type="checkbox" defaultChecked className="w-6 h-6 accent-orange-500" />
              </div>
            </div>

            {/* Sección de Límites (expandible) */}
            <button
              onClick={() => setExpandirLimites(!expandirLimites)}
              className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
            >
              <span className="font-semibold text-orange-600">Límites de gasto por categoría</span>
              <ChevronDown size={20} className={`text-orange-600 transition ${expandirLimites ? 'rotate-180' : ''}`} />
            </button>

            {expandirLimites && (
              <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                {categorias && categorias.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="flex-1 text-sm font-medium">{cat.nombre}</span>
                    <input
                      type="number"
                      placeholder="—"
                      value={limites[cat.nombre] || ''}
                      onChange={(e) => establecerLimite(cat.nombre, e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-16 border border-gray-300 rounded p-1 text-right text-sm"
                    />
                    <span className="text-sm text-gray-600">€</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2 italic">Deja vacío para no vigilar esa categoría.</p>
              </div>
            )}
          </div>
        </div>

        {/* COPIA DE SEGURIDAD */}
        <div className="bg-white">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase mb-4">Copia de seguridad</h2>
            
            <div className="space-y-2">
              <button
                onClick={exportar}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Download size={18} />
                  Exportar copia
                </span>
                <ChevronRight size={20} />
              </button>

              <label className="block cursor-pointer">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition font-semibold text-sm">
                  <span className="flex items-center gap-2">
                    <Upload size={18} />
                    Importar copia
                  </span>
                  <ChevronRight size={20} />
                </div>
                <input type="file" accept=".json" onChange={importar} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
