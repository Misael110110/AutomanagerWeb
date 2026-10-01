import { ArrowLeft, History, Wrench, Package, ClipboardList } from 'lucide-react';
import type { Event } from '../../types';

interface HistoryViewProps {
  events: Event[];
  onBack: () => void;
}

export function HistoryView({ events, onBack }: HistoryViewProps) {
  const getIconAndColor = (kind: Event['kind']) => {
    switch (kind) {
      case 'inventario':
        return {
          icon: Package,
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'herramienta':
        return {
          icon: Wrench,
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'tarea':
        return {
          icon: ClipboardList,
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      default:
        return {
          icon: History,
          bg: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-500',
        };
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-extrabold text-[#1264A3] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver a opciones</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
          Historial y Auditoría
        </h1>
        <p className="text-[#697586] text-xs sm:text-sm">
          Registro cronológico de quién hizo qué y cuándo en el taller.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
        {events.length === 0 ? (
          <p className="text-center py-8 text-[#697586] text-sm">
            No hay eventos registrados en el historial.
          </p>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EAF0]">
            {events.map((evt) => {
              const { dot } = getIconAndColor(evt.kind);
              return (
                <div key={evt.id} className="relative">
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${dot}`}
                  />
                  <div className="bg-[#F6F8FB] p-3.5 rounded-xl border border-[#E5EAF0]/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-sm font-bold text-[#192235]">{evt.title}</p>
                      <span className="text-[11px] text-[#697586] font-medium">{evt.date}</span>
                    </div>
                    <p className="text-xs text-[#536174] mt-1">{evt.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
