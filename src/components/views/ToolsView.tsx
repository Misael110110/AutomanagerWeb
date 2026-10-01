import { ArrowLeft, User, Wrench } from 'lucide-react';
import type { Tool } from '../../types';
import { StatusChip } from '../common/StatusChip';

interface ToolsViewProps {
  tools: Tool[];
  onBack: () => void;
  onToggle: (id: string) => void;
}

export function ToolsView({ tools, onBack, onToggle }: ToolsViewProps) {
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
          Control de Herramientas
        </h1>
        <p className="text-[#697586] text-xs sm:text-sm">
          Disponibilidad, asignación técnica, préstamo y devolución.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const isAvailable = tool.status === 'DISPONIBLE';
          const isMaintenance = tool.status === 'MANTENIMIENTO';

          return (
            <div
              key={tool.id}
              className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#1264A3]" />
                  <h3 className="font-extrabold text-base text-[#192235] truncate">{tool.name}</h3>
                </div>
                <p className="text-xs text-[#697586] mt-0.5">
                  Código: <span className="font-semibold">{tool.code}</span> · {tool.location}
                </p>

                {tool.assignee && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#6A3FC7]">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      Asignada a {tool.assignee}
                      {tool.orderId ? ` (${tool.orderId})` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusChip status={tool.status} />
                {!isMaintenance && (
                  <button
                    type="button"
                    onClick={() => onToggle(tool.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      isAvailable
                        ? 'bg-[#E9F1F9] hover:bg-[#d5e7f7] text-[#0B4F85]'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isAvailable ? 'Prestar' : 'Devolver'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
