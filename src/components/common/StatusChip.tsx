import { colorFor, displayStatus, priorityLabel } from '../../data/seed';
import type { OrderStatus, Priority, TaskStatus, ToolStatus } from '../../types';

export function StatusChip({
  status,
}: {
  status: OrderStatus | TaskStatus | ToolStatus;
}) {
  const color = colorFor(status);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      {displayStatus(status)}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: Priority }) {
  const isHigh = priority === 'ALTA';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
        isHigh
          ? 'bg-red-50 text-red-700 border border-red-200'
          : priority === 'NORMAL'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-gray-100 text-gray-700'
      }`}
    >
      Prioridad {priorityLabel[priority]}
    </span>
  );
}
