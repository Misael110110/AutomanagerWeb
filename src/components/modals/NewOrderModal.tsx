import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { Priority, Vehicle } from '../../types';

interface NewOrderModalProps {
  visible: boolean;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (plate: string, problem: string, priority: Priority) => { success: boolean; message?: string };
}

export function NewOrderModal({ visible, vehicles, onClose, onSave }: NewOrderModalProps) {
  const [plate, setPlate] = useState(vehicles[0]?.plate ?? '');
  const [problem, setProblem] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible && vehicles.length > 0 && !plate) {
      setPlate(vehicles[0]?.plate ?? '');
    }
  }, [visible, vehicles, plate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = onSave(plate, problem, priority);
    if (!res.success) {
      setErrorMsg(res.message ?? 'Error al crear la orden.');
      return;
    }

    setProblem('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5EAF0] overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F6F8FB]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545]">
            Nueva Orden de Trabajo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select vehicle */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
              Vehículo registrado *
            </label>
            <select
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              required
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate} — {v.brand} {v.model} ({v.customer})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#697586] mt-1">
              Si el vehículo no está en la lista, regístrelo primero en la pestaña "Vehículos".
            </p>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
              Problema reportado por el cliente *
            </label>
            <textarea
              rows={3}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Ej.: Ruido en tren delantero al frenar, cambio de aceite y filtro..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1.5">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ALTA', 'NORMAL', 'BAJA'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                    priority === p
                      ? p === 'ALTA'
                        ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                        : p === 'NORMAL'
                          ? 'bg-[#E9F1F9] text-[#0B4F85] border-blue-300 shadow-xs'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-[#F6F8FB] text-[#697586] border-[#E5EAF0] hover:bg-gray-100'
                  }`}
                >
                  {p === 'ALTA' ? 'Alta 🔴' : p === 'NORMAL' ? 'Normal 🔵' : 'Baja ⚪'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E5EAF0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-xs transition-colors cursor-pointer"
            >
              Crear orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
