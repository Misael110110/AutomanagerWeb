import { ArrowLeft, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import type { Part, WorkOrder } from '../../types';
import { C } from '../../data/seed';

interface ReportsViewProps {
  orders: WorkOrder[];
  parts: Part[];
  onBack: () => void;
}

export function ReportsView({ orders, parts, onBack }: ReportsViewProps) {
  const allTasks = orders.flatMap((o) => o.tasks);
  const doneTasks = allTasks.filter((t) => t.status === 'COMPLETADA').length;
  const lowStockCount = parts.filter((p) => p.stock <= p.minimum).length;
  const highPriorityCount = orders.filter(
    (o) => o.priority === 'ALTA' && o.status !== 'ENTREGADA'
  ).length;

  const rows: Array<[string, number, string]> = [
    ['En proceso', orders.filter((o) => o.status === 'EN_PROCESO').length, C.blue],
    ['Esperando repuesto', orders.filter((o) => o.status === 'ESPERANDO_REPUESTO').length, C.amber],
    ['Listas para entrega', orders.filter((o) => o.status === 'LISTA').length, C.green],
    ['Entregadas', orders.filter((o) => o.status === 'ENTREGADA').length, C.muted],
  ];

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
          Reportes Operativos
        </h1>
        <p className="text-[#697586] text-xs sm:text-sm">
          Indicadores clave para decisiones diarias del taller mecánico.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#0B2545]">
              {doneTasks}/{allTasks.length}
            </span>
            <CheckCircle2 className="w-5 h-5 text-[#137B4B]" />
          </div>
          <p className="text-xs font-bold text-[#697586] mt-1">Tareas completadas</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-700">{lowStockCount}</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-[#697586] mt-1">Artículos bajo mínimo</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-red-700">{highPriorityCount}</span>
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs font-bold text-[#697586] mt-1">Órdenes de alta prioridad</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#0B2545]">Órdenes por estado operativo</h3>
        <div className="space-y-3">
          {rows.map(([label, value, color]) => (
            <div
              key={label}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6F8FB] border border-[#E5EAF0]/60"
            >
              <span className="text-sm font-bold text-[#192235]">{label}</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-black"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {value} órdenes
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 mt-4">
          <p className="font-bold">Próxima versión (V2):</p>
          <p className="mt-0.5 text-blue-800">
            Se incluirán filtros por período (semanal/mensual), exportación a PDF/Excel y análisis
            de tiempos medios de reparación.
          </p>
        </div>
      </div>
    </div>
  );
}
