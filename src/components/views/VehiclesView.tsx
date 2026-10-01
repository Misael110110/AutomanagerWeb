import { useState } from 'react';
import { Car, Phone, Plus, Search, User } from 'lucide-react';
import type { Vehicle, WorkOrder } from '../../types';
import { StatusChip } from '../common/StatusChip';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  orders: WorkOrder[];
  onNew: () => void;
  onOpen: (id: string) => void;
}

export function VehiclesView({ vehicles, orders, onNew, onOpen }: VehiclesViewProps) {
  const [search, setSearch] = useState('');

  const filtered = vehicles.filter((v) =>
    [v.plate, v.brand, v.model, v.customer, v.phone, v.year]
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const getActiveOrderStatus = (vehicleId: string) => {
    return orders.find(
      (order) =>
        order.vehicleId === vehicleId && !['ENTREGADA', 'CANCELADA'].includes(order.status)
    )?.status;
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
            Vehículos y Clientes
          </h1>
          <p className="text-[#697586] text-xs sm:text-sm">
            Expediente vehicular, datos de contacto de clientes e historial de servicios.
          </p>
        </div>

        <button
          type="button"
          onClick={onNew}
          className="self-start sm:self-auto flex items-center gap-2 bg-[#1264A3] hover:bg-[#0E5186] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar vehículo</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF0] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, cliente, teléfono, marca o modelo…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30 focus:border-[#1264A3]"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EAF0] text-[#697586] text-sm">
          No se encontraron vehículos registrados con esos criterios.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vehicle) => {
            const activeStatus = getActiveOrderStatus(vehicle.id);
            return (
              <div
                key={vehicle.id}
                onClick={() => onOpen(vehicle.id)}
                className="bg-white rounded-2xl p-5 border border-[#E5EAF0] hover:border-[#1264A3]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#E9F1F9] text-[#0B4F85] rounded-lg font-black text-xs tracking-wider border border-blue-200/50">
                      {vehicle.plate}
                    </span>
                    {activeStatus ? (
                      <StatusChip status={activeStatus} />
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Sin orden activa
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-[#192235] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#1264A3]" />
                    <span>
                      {vehicle.brand} {vehicle.model}
                    </span>
                    <span className="text-xs font-normal text-gray-400">({vehicle.year})</span>
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-[#536174]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-[#192235]">{vehicle.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{vehicle.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5EAF0] text-[11px] text-[#697586] flex justify-between items-center">
                  <span>Kilometraje:</span>
                  <span className="font-bold text-[#192235]">{vehicle.mileage}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
