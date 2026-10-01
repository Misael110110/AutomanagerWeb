export type Role = 'ENCARGADO' | 'MECANICO';

export type Tab = 'Inicio' | 'Órdenes' | 'Vehículos' | 'Inventario' | 'Más';

export type MoreView = 'MENU' | 'HERRAMIENTAS' | 'HISTORIAL' | 'REPORTES' | 'EQUIPO';

export type Priority = 'ALTA' | 'NORMAL' | 'BAJA';

export type OrderStatus =
  | 'RECIBIDA'
  | 'DIAGNOSTICO'
  | 'PLANIFICADA'
  | 'EN_PROCESO'
  | 'ESPERANDO_REPUESTO'
  | 'EN_REVISION'
  | 'LISTA'
  | 'ENTREGADA'
  | 'CANCELADA';

export type TaskStatus = 'PENDIENTE' | 'ASIGNADA' | 'EN_PROCESO' | 'PAUSADA' | 'COMPLETADA';

export type ToolStatus = 'DISPONIBLE' | 'ASIGNADA' | 'MANTENIMIENTO';

export interface LocalProfile {
  id: string;
  name: string;
  pin: string;
  role: Role;
  businessCode: string;
}

export interface LocalBusiness {
  code: string;
  name: string;
  managerName: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  customer: string;
  phone: string;
  mileage: string;
}

export interface Task {
  id: string;
  title: string;
  mechanic: string;
  status: TaskStatus;
  note?: string;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  problem: string;
  diagnosis?: string;
  status: OrderStatus;
  priority: Priority;
  createdAt: string;
  due: string;
  tasks: Task[];
}

export interface Part {
  id: string;
  name: string;
  code: string;
  stock: number;
  minimum: number;
  location: string;
  unit: string;
}

export interface Tool {
  id: string;
  name: string;
  code: string;
  status: ToolStatus;
  location: string;
  assignee?: string;
  orderId?: string;
}

export interface Event {
  id: string;
  title: string;
  detail: string;
  date: string;
  kind: 'orden' | 'tarea' | 'inventario' | 'herramienta';
}

export interface PrototypeState {
  vehicles: Vehicle[];
  orders: WorkOrder[];
  parts: Part[];
  tools: Tool[];
  events: Event[];
}
