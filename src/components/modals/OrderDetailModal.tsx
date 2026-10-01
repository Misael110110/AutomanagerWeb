import { useEffect, useState } from 'react';
import { AlertCircle, Check, Plus, X } from 'lucide-react';
import { displayStatus, nextStatus } from '../../data/seed';
import type { Role, TaskStatus, Vehicle, WorkOrder } from '../../types';
import { PriorityChip, StatusChip } from '../common/StatusChip';

interface OrderDetailModalProps {
  order: WorkOrder | null;
  vehicle: Vehicle | null;
  role: Role;
  onClose: () => void;
  onAdvance: (id: string) => { success: boolean; message?: string };
  onWaitPart: (id: string) => void;
  onTask: (orderId: string, taskId: string, status: TaskStatus) => void;
  onAddTask: (orderId: string, title: string) => boolean;
}

export function OrderDetailModal({
  order,
  vehicle,
  role,
  onClose,
  onAdvance,
  onWaitPart,
  onTask,
  onAddTask,
}: OrderDetailModalProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const next = nextStatus(order.status);

  const getNextTaskStatus = (status: TaskStatus): TaskStatus | null => {
    if (status === 'PENDIENTE' || status === 'ASIGNADA' || status === 'PAUSADA') {
      return 'EN_PROCESO';
    }
    if (status === 'EN_PROCESO') {
      return 'COMPLETADA';
    }
    return null;
  };

  const handleAdvance = () => {
    setErrorMsg(null);
    const result = onAdvance(order.id);
    if (!result.success && result.message) {
      setErrorMsg(result.message);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (onAddTask(order.id, newTaskTitle)) {
      setNewTaskTitle('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E5EAF0] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F6F8FB]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#1264A3] bg-blue-100/60 px-2 py-0.5 rounded-md">
                {order.id}
              </span>
              <PriorityChip priority={order.priority} />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545] mt-1">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo'} ·{' '}
              <span className="text-[#1264A3]">{vehicle?.plate}</span>
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

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6F8FB] border border-[#E5EAF0]">
            <div>
              <span className="text-xs text-[#697586] block">Estado de la orden:</span>
              <span className="text-sm font-extrabold text-[#0B2545]">
                {displayStatus(order.status)}
              </span>
            </div>
            <StatusChip status={order.status} />
          </div>

          {/* Problem & Diagnosis */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-[#697586] tracking-wider mb-1">
                Problema reportado
              </h4>
              <p className="text-sm text-[#192235] bg-[#F6F8FB] p-3.5 rounded-xl border border-[#E5EAF0]">
                {order.problem}
              </p>
            </div>

            {order.diagnosis && (
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[#697586] tracking-wider mb-1">
                  Diagnóstico técnico
                </h4>
                <p className="text-sm text-[#192235] bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                  {order.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase text-[#697586] tracking-wider">
                Tareas técnicas ({order.tasks.filter((t) => t.status === 'COMPLETADA').length}/
                {order.tasks.length})
              </h4>
              <span className="text-[11px] text-[#697586]">Clic en el botón para avanzar estado</span>
            </div>

            <div className="space-y-2">
              {order.tasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  No hay tareas registradas para esta orden aún.
                </p>
              ) : (
                order.tasks.map((task) => {
                  const nextTaskState = getNextTaskStatus(task.status);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-[#E5EAF0] bg-white flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#192235] truncate">{task.title}</p>
                        <p className="text-xs text-[#697586]">
                          Mecánico: <span className="font-semibold">{task.mechanic}</span>
                          {task.note && ` · Nota: ${task.note}`}
                        </p>
                      </div>

                      {nextTaskState ? (
                        <button
                          type="button"
                          onClick={() => onTask(order.id, task.id, nextTaskState)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#E9F1F9] hover:bg-blue-100 text-[#0B4F85] transition-colors cursor-pointer"
                        >
                          <StatusChip status={task.status} />
                          <span className="text-[10px] text-gray-500">→ Avanzar</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[#137B4B] text-xs font-extrabold">
                          <Check className="w-4 h-4" />
                          <span>Completada</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Task Form (ENCARGADO) */}
            {role === 'ENCARGADO' && order.status !== 'ENTREGADA' && (
              <form onSubmit={handleAddTask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Agregar nueva tarea técnica..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-[#1264A3] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-[#0E5186] transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-[#F6F8FB] border-t border-[#E5EAF0] flex flex-wrap items-center justify-between gap-3">
          <div>
            {order.status !== 'ESPERANDO_REPUESTO' &&
              !['ENTREGADA', 'CANCELADA'].includes(order.status) && (
                <button
                  type="button"
                  onClick={() => onWaitPart(order.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  Esperar repuesto
                </button>
              )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {next && (
              <button
                type="button"
                onClick={handleAdvance}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-xs transition-colors cursor-pointer"
              >
                {next === 'ENTREGADA' ? 'Confirmar entrega' : `Avanzar a ${displayStatus(next)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
