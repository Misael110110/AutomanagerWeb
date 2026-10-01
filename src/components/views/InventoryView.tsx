import { useState } from 'react';
import { AlertCircle, ArrowDownUp, Layers, Minus, Plus } from 'lucide-react';
import type { Event, Part } from '../../types';

interface InventoryViewProps {
  parts: Part[];
  lowStock: Part[];
  events: Event[];
  onConsume: (id: string) => { success: boolean; message?: string };
  onReceive: (id: string) => void;
}

export function InventoryView({
  parts,
  lowStock,
  events,
  onConsume,
  onReceive,
}: InventoryViewProps) {
  const [view, setView] = useState<'STOCK' | 'MOVIMIENTOS'>('STOCK');
  const inventoryEvents = events.filter((e) => e.kind === 'inventario');

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
            Inventario de Repuestos
          </h1>
          <p className="text-[#697586] text-xs sm:text-sm">
            {lowStock.length > 0
              ? `Atención: ${lowStock.length} artículos están en o por debajo del mínimo.`
              : 'Existencias actualizadas en tiempo real.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-1 rounded-xl border border-[#E5EAF0]">
          <button
            type="button"
            onClick={() => setView('STOCK')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              view === 'STOCK'
                ? 'bg-[#1264A3] text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192235]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Existencias</span>
          </button>
          <button
            type="button"
            onClick={() => setView('MOVIMIENTOS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              view === 'MOVIMIENTOS'
                ? 'bg-[#1264A3] text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192235]'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>Movimientos</span>
          </button>
        </div>
      </div>

      {view === 'STOCK' ? (
        <div className="space-y-4">
          {lowStock.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Alerta de reposición</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Los siguientes artículos necesitan pedido urgente:{' '}
                  <span className="font-bold">
                    {lowStock.map((p) => p.name).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parts.map((item) => {
              const isLow = item.stock <= item.minimum;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between gap-4 transition-all ${
                    isLow ? 'border-amber-300 bg-amber-50/20' : 'border-[#E5EAF0]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-[#192235] truncate">
                        {item.name}
                      </h3>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold shrink-0">
                          Bajo stock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Código: <span className="font-semibold">{item.code}</span> · {item.location}
                    </p>
                    <div className="mt-2 text-xs flex items-center gap-2">
                      <span
                        className={`font-black text-sm ${
                          isLow ? 'text-amber-700' : 'text-[#137B4B]'
                        }`}
                      >
                        {item.stock} {item.unit}
                      </span>
                      <span className="text-gray-400">/ Mínimo: {item.minimum}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onReceive(item.id)}
                      title="Registrar entrada de 1 unidad"
                      className="flex items-center justify-center gap-1 bg-[#E9F1F9] hover:bg-[#d8e8f8] text-[#0B4F85] px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1 Entrada</span>
                    </button>
                    <button
                      type="button"
                      disabled={item.stock === 0}
                      onClick={() => {
                        const res = onConsume(item.id);
                        if (!res.success && res.message) {
                          alert(res.message);
                        }
                      }}
                      title="Registrar salida de 1 unidad"
                      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                        item.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Usar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Movimientos / History */
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
          <h3 className="font-extrabold text-base text-[#0B2545] mb-4">Registro de Movimientos</h3>
          {inventoryEvents.length === 0 ? (
            <p className="text-center py-8 text-[#697586] text-sm">
              No hay movimientos de inventario registrados.
            </p>
          ) : (
            <div className="divide-y divide-[#E5EAF0]">
              {inventoryEvents.map((evt) => (
                <div key={evt.id} className="py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowDownUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#192235]">{evt.title}</p>
                      <span className="text-[11px] text-[#697586]">{evt.date}</span>
                    </div>
                    <p className="text-xs text-[#697586] mt-0.5">{evt.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
