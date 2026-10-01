import { useEffect } from 'react';
import { Car, Phone, User, X } from 'lucide-react';
import type { Vehicle, WorkOrder } from '../../types';
import { StatusChip } from '../common/StatusChip';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  orders: WorkOrder[];
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export function VehicleDetailModal({
  vehicle,
  orders,
  onClose,
  onSelectOrder,
}: VehicleDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E5EAF0] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F6F8FB]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#1264A3] text-white rounded-lg font-black text-sm tracking-wider shadow-xs">
              {vehicle.plate}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545]">
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Owner details card */}
          <div className="bg-[#F6F8FB] rounded-2xl p-4 border border-[#E5EAF0] space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#697586] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>Cliente:</span>
              </span>
              <span className="font-extrabold text-[#192235]">{vehicle.customer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#697586] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>Teléfono:</span>
              </span>
              <span className="font-bold text-[#1264A3]">{vehicle.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#697586] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-gray-400" />
                <span>Kilometraje registrado:</span>
              </span>
              <span className="font-bold text-[#192235]">{vehicle.mileage}</span>
            </div>
          </div>

          {/* Orders history */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-[#697586] tracking-wider mb-3">
              Historial de órdenes de trabajo ({orders.length})
            </h4>

            {orders.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-xl">
                No hay órdenes registradas para este vehículo aún.
              </div>
            ) : (
              <div className="space-y-2.5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      onClose();
                      onSelectOrder(order.id);
                    }}
                    className="p-3.5 rounded-xl border border-[#E5EAF0] bg-white hover:border-[#1264A3]/50 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#1264A3]">{order.id}</span>
                        <span className="text-[11px] text-[#697586]">{order.createdAt}</span>
                      </div>
                      <p className="text-xs text-[#192235] font-medium line-clamp-1 mt-0.5">
                        {order.problem}
                      </p>
                    </div>
                    <StatusChip status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 bg-[#F6F8FB] border-t border-[#E5EAF0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
