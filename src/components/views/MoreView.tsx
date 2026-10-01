import {
  ChevronRight,
  ClipboardList,
  History,
  LogOut,
  RotateCcw,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import type { MoreView as MoreViewType, Part } from '../../types';

interface MoreViewProps {
  lowStock: Part[];
  cloudSyncStatus: string;
  onOpen: (view: MoreViewType) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export function MoreView({
  lowStock,
  cloudSyncStatus,
  onOpen,
  onLogout,
  onResetData,
}: MoreViewProps) {
  const menu: Array<{
    id: Exclude<MoreViewType, 'MENU'>;
    title: string;
    detail: string;
    icon: typeof Wrench;
  }> = [
    {
      id: 'HERRAMIENTAS',
      title: 'Herramientas',
      detail: 'Préstamo, devolución y estado físico',
      icon: Wrench,
    },
    {
      id: 'HISTORIAL',
      title: 'Historial y auditoría',
      detail: 'Registro de cambios y eventos',
      icon: History,
    },
    {
      id: 'REPORTES',
      title: 'Reportes operativos',
      detail: 'Tiempos, estados y recursos clave',
      icon: ClipboardList,
    },
    {
      id: 'EQUIPO',
      title: 'Equipo de trabajo',
      detail: 'Carga de trabajo visible por mecánico',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">Más opciones</h1>
        <p className="text-[#697586] text-xs sm:text-sm">
          Módulos adicionales de administración y soporte del taller.
        </p>
      </div>

      {cloudSyncStatus && (
        <div className="p-3.5 rounded-xl bg-[#E9F1F9] border border-blue-200 text-[#0B4F85] text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Estado de sincronización: {cloudSyncStatus}</span>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onOpen(item.id)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5EAF0] hover:border-[#1264A3]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F6F8FB] border border-[#E5EAF0] flex items-center justify-center text-[#1264A3]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#192235]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#697586]">{item.detail}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Low stock summary info */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
        <h4 className="text-xs font-extrabold uppercase text-[#7B4D00] tracking-wider mb-1">
          Atención de inventario
        </h4>
        <p className="text-xs text-[#697586]">
          {lowStock.length > 0
            ? `Artículos críticos con stock bajo: ${lowStock.map((p) => p.name).join(', ')}.`
            : 'Todo el inventario de repuestos se encuentra actualmente sobre el nivel mínimo.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Restablecer los datos a los valores iniciales de demostración?')) {
              onResetData();
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
          <span>Restablecer datos demo</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
