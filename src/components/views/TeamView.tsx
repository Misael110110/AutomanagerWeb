import { ArrowLeft, Shield } from 'lucide-react';

interface TeamViewProps {
  onBack: () => void;
}

export function TeamView({ onBack }: TeamViewProps) {
  const members = [
    { name: 'Ángel Martínez', role: 'Encargado / Gerente', work: 'Coordinación, recepción y entregas' },
    { name: 'Carlos', role: 'Mecánico', work: '2 tareas activas asignadas' },
    { name: 'José', role: 'Mecánico', work: '1 tarea bloqueada por repuesto' },
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
          Equipo de Trabajo
        </h1>
        <p className="text-[#697586] text-xs sm:text-sm">
          Distribución de responsabilidades y carga operativa en el taller.
        </p>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.name}
            className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DDEAF7] text-[#0B4F85] flex items-center justify-center font-black text-sm">
                {m.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#192235]">{m.name}</h3>
                <p className="text-xs text-[#697586]">{m.role}</p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#1264A3] bg-[#E9F1F9] px-3 py-1.5 rounded-xl border border-blue-100">
              {m.work}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-xs flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#1264A3] shrink-0 mt-0.5" />
        <div className="text-xs text-[#536174] space-y-1">
          <p className="font-bold text-[#192235]">Permisos y Roles:</p>
          <p>
            <strong className="text-[#0B2545]">Encargado:</strong> Registra y entrega vehículos, crea
            nuevas órdenes de trabajo y administra el inventario.
          </p>
          <p>
            <strong className="text-[#0B2545]">Mecánico:</strong> Actualiza el estado de sus tareas,
            registra préstamos de herramientas y reporta piezas faltantes.
          </p>
        </div>
      </div>
    </div>
  );
}
