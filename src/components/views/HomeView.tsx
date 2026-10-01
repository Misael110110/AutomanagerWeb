import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Wrench } from 'lucide-react';
import type { Part, Role, Tab, Vehicle, WorkOrder } from '../../types';
import { StatusChip } from '../common/StatusChip';

interface HomeViewProps {
  role: Role;
  user: string;
  orders: WorkOrder[];
  vehicles: Vehicle[];
  lowStock: Part[];
  onTab: (tab: Tab) => void;
  onOpenOrder: (id: string) => void;
}

export function HomeView({
  role,
  user,
  orders,
  vehicles,
  lowStock,
  onTab,
  onOpenOrder,
}: HomeViewProps) {
  const activeOrders = orders.filter(
    (order) => !['ENTREGADA', 'CANCELADA'].includes(order.status)
  );

  const allTasks = orders.flatMap((order) =>
    order.tasks.map((task) => ({ order, task }))
  ).filter(({ task }) => task.status !== 'COMPLETADA');

  const shownTasks =
    role === 'MECANICO'
      ? allTasks.filter(({ task }) => task.mechanic.toLowerCase() === user.toLowerCase())
      : allTasks;

  const attentionOrders = orders
    .filter((order) => order.priority === 'ALTA' || order.status === 'ESPERANDO_REPUESTO')
    .slice(0, 4);

  const readyOrders = orders.filter((order) => order.status === 'LISTA');

  const firstName = user.split(' ')[0] ?? 'Usuario';

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF0] shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
          Buenos días, {firstName}
        </h1>
        <p className="text-[#697586] text-sm mt-1">
          {role === 'ENCARGADO'
            ? 'Panel de control: esto requiere atención hoy en el taller.'
            : 'Panel técnico: revise y continúe con su siguiente tarea asignada.'}
        </p>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          <div
            onClick={() => onTab('Órdenes')}
            className="p-4 rounded-xl bg-[#F6F8FB] border-l-4 border-[#1264A3] hover:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1264A3]">
                {activeOrders.length}
              </span>
              <Clock className="w-5 h-5 text-[#1264A3]/50" />
            </div>
            <p className="text-xs font-bold text-[#697586] mt-1">Órdenes activas</p>
          </div>

          <div
            onClick={() => onTab('Órdenes')}
            className="p-4 rounded-xl bg-[#F6F8FB] border-l-4 border-[#6A3FC7] hover:bg-purple-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#6A3FC7]">
                {shownTasks.length}
              </span>
              <Wrench className="w-5 h-5 text-[#6A3FC7]/50" />
            </div>
            <p className="text-xs font-bold text-[#697586] mt-1">
              {role === 'MECANICO' ? 'Mis tareas pendientes' : 'Tareas pendientes'}
            </p>
          </div>

          <div
            onClick={() => onTab('Inventario')}
            className="p-4 rounded-xl bg-[#F6F8FB] border-l-4 border-[#A15C00] hover:bg-amber-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#A15C00]">
                {lowStock.length}
              </span>
              <AlertTriangle className="w-5 h-5 text-[#A15C00]/50" />
            </div>
            <p className="text-xs font-bold text-[#697586] mt-1">Stock bajo</p>
          </div>

          <div
            onClick={() => onTab('Órdenes')}
            className="p-4 rounded-xl bg-[#F6F8FB] border-l-4 border-[#137B4B] hover:bg-green-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#137B4B]">
                {readyOrders.length}
              </span>
              <CheckCircle2 className="w-5 h-5 text-[#137B4B]/50" />
            </div>
            <p className="text-xs font-bold text-[#697586] mt-1">Listas para entrega</p>
          </div>
        </div>
      </div>

      {/* Grid: Attention & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requiere Atención */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-base sm:text-lg font-extrabold text-[#0B2545]">
                  Requiere atención
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onTab('Órdenes')}
                className="text-xs font-bold text-[#1264A3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver órdenes <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {attentionOrders.length === 0 ? (
              <div className="text-center py-8 text-[#697586] text-sm">
                No hay órdenes urgentes ni bloqueadas actualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {attentionOrders.map((order) => {
                  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                  const isBlocked = order.status === 'ESPERANDO_REPUESTO';
                  return (
                    <div
                      key={order.id}
                      onClick={() => onOpenOrder(order.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                        isBlocked
                          ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
                          : 'bg-red-50/50 border-red-200 hover:bg-red-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                            isBlocked
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-red-200 text-red-900'
                          }`}
                        >
                          !
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#192235]">
                            {vehicle?.plate} · {order.id}
                          </p>
                          <p className="text-xs text-[#697586] line-clamp-1">
                            {isBlocked
                              ? 'Bloqueada: en espera de repuesto'
                              : `Urgente: ${order.problem}`}
                          </p>
                        </div>
                      </div>
                      <StatusChip status={order.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tareas Activas */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0B2545]">
                {role === 'MECANICO' ? 'Mis tareas activas' : 'Tareas en taller'}
              </h2>
              <button
                type="button"
                onClick={() => onTab('Órdenes')}
                className="text-xs font-bold text-[#1264A3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {shownTasks.length === 0 ? (
              <div className="text-center py-8 text-[#697586] text-sm">
                No hay tareas pendientes en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {shownTasks.slice(0, 4).map(({ order, task }) => (
                  <div
                    key={task.id}
                    onClick={() => onOpenOrder(order.id)}
                    className="p-3.5 rounded-xl border border-[#E5EAF0] bg-white hover:bg-gray-50 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#192235]">{task.title}</p>
                      <p className="text-xs text-[#697586]">
                        {order.id} · Asignado a: <span className="font-semibold">{task.mechanic}</span>
                      </p>
                    </div>
                    <StatusChip status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
