import { useState } from 'react';
import { Calendar, CheckSquare, Plus, Search } from 'lucide-react';
import type { Role, Vehicle, WorkOrder } from '../../types';
import { PriorityChip, StatusChip } from '../common/StatusChip';

interface OrdersViewProps {
  role: Role;
  orders: WorkOrder[];
  vehicles: Vehicle[];
  onNew: () => void;
  onOpen: (id: string) => void;
}

type OrderFilter = 'ACTIVAS' | 'BLOQUEADAS' | 'LISTAS' | 'TODAS';

export function OrdersView({ role, orders, vehicles, onNew, onOpen }: OrdersViewProps) {
  const [filter, setFilter] = useState<OrderFilter>('ACTIVAS');
  const [query, setQuery] = useState('');

  const filtered = orders.filter((order) => {
    const vehicle = vehicles.find((item) => item.id === order.vehicleId);
    const q = query.trim().toLowerCase();
    const matches =
      !q ||
      [order.id, order.problem, vehicle?.plate, vehicle?.customer, vehicle?.brand, vehicle?.model]
        .join(' ')
        .toLowerCase()
        .includes(q);

    const states =
      filter === 'TODAS' ||
      (filter === 'ACTIVAS' && !['ENTREGADA', 'CANCELADA', 'LISTA'].includes(order.status)) ||
      (filter === 'BLOQUEADAS' && order.status === 'ESPERANDO_REPUESTO') ||
      (filter === 'LISTAS' && order.status === 'LISTA');

    return matches && states;
  });

  const filterOptions: Array<{ id: OrderFilter; label: string }> = [
    { id: 'ACTIVAS', label: 'Activas' },
    { id: 'BLOQUEADAS', label: 'Bloqueadas' },
    { id: 'LISTAS', label: 'Listas' },
    { id: 'TODAS', label: 'Todas' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
            Órdenes de trabajo
          </h1>
          <p className="text-[#697586] text-xs sm:text-sm">
            {role === 'ENCARGADO'
              ? 'Recepción, diagnóstico, planificación y entrega de vehículos.'
              : 'Seguimiento de órdenes y avance de tareas del taller.'}
          </p>
        </div>

        {role === 'ENCARGADO' && (
          <button
            type="button"
            onClick={onNew}
            className="self-start sm:self-auto flex items-center gap-2 bg-[#1264A3] hover:bg-[#0E5186] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva orden</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF0] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código (ej. OT-00125), placa o cliente…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30 focus:border-[#1264A3]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === opt.id
                  ? 'bg-[#1264A3] text-white shadow-xs'
                  : 'bg-[#F6F8FB] text-[#697586] hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EAF0] text-[#697586] text-sm">
          No se encontraron órdenes para este filtro o criterio de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((order) => {
            const vehicle = vehicles.find((v) => v.id === order.vehicleId);
            const doneTasks = order.tasks.filter((t) => t.status === 'COMPLETADA').length;

            return (
              <div
                key={order.id}
                onClick={() => onOpen(order.id)}
                className="bg-white rounded-2xl p-5 border border-[#E5EAF0] hover:border-[#1264A3]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1264A3] text-sm tracking-wide">
                        {order.id}
                      </span>
                      <PriorityChip priority={order.priority} />
                    </div>
                    <StatusChip status={order.status} />
                  </div>

                  <h3 className="font-extrabold text-base text-[#192235]">
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo'} ·{' '}
                    <span className="text-[#1264A3] font-bold">{vehicle?.plate}</span>
                  </h3>
                  <p className="text-xs text-[#697586] mb-3">Cliente: {vehicle?.customer}</p>

                  <p className="text-xs sm:text-sm text-[#364152] line-clamp-2 bg-[#F6F8FB] p-2.5 rounded-lg border border-[#E5EAF0]/60">
                    {order.problem}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5EAF0] flex items-center justify-between text-xs text-[#697586]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Entrega: {order.due}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckSquare className="w-3.5 h-3.5 text-[#1264A3]" />
                    <span>
                      {doneTasks}/{order.tasks.length} tareas
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
