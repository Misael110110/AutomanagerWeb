import type {
  Event,
  LocalBusiness,
  LocalProfile,
  OrderStatus,
  Part,
  Priority,
  TaskStatus,
  Tool,
  ToolStatus,
  Vehicle,
  WorkOrder,
} from '../types';

export const C = {
  navy: '#0B2545',
  blue: '#1264A3',
  green: '#137B4B',
  amber: '#A15C00',
  red: '#B42318',
  ink: '#192235',
  muted: '#697586',
  line: '#E5EAF0',
  surface: '#FFFFFF',
  bg: '#F6F8FB',
};

export const orderLabel: Record<OrderStatus, string> = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  PLANIFICADA: 'Planificada',
  EN_PROCESO: 'En proceso',
  ESPERANDO_REPUESTO: 'Esperando repuesto',
  EN_REVISION: 'En revisión',
  LISTA: 'Lista para entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export const taskLabel: Record<TaskStatus, string> = {
  PENDIENTE: 'Pendiente',
  ASIGNADA: 'Asignada',
  EN_PROCESO: 'En proceso',
  PAUSADA: 'Pausada',
  COMPLETADA: 'Completada',
};

export const toolLabel: Record<ToolStatus, string> = {
  DISPONIBLE: 'Disponible',
  ASIGNADA: 'Asignada',
  MANTENIMIENTO: 'Mantenimiento',
};

export const priorityLabel: Record<Priority, string> = {
  ALTA: 'Alta',
  NORMAL: 'Normal',
  BAJA: 'Baja',
};

export const vehiclesSeed: Vehicle[] = [
  {
    id: 'v1',
    plate: 'M 345-982',
    brand: 'Toyota',
    model: 'Corolla',
    year: '2014',
    customer: 'María López',
    phone: '8888-1234',
    mileage: '142,350 km',
  },
  {
    id: 'v2',
    plate: 'CH 891-210',
    brand: 'Hyundai',
    model: 'Accent',
    year: '2018',
    customer: 'Juan Pérez',
    phone: '7777-4500',
    mileage: '96,000 km',
  },
  {
    id: 'v3',
    plate: 'M 612-774',
    brand: 'Kia',
    model: 'Sportage',
    year: '2016',
    customer: 'Carlos Ruiz',
    phone: '8456-7890',
    mileage: '118,500 km',
  },
  {
    id: 'v4',
    plate: 'M 009-457',
    brand: 'Nissan',
    model: 'Frontier',
    year: '2019',
    customer: 'Ana Martínez',
    phone: '8255-3020',
    mileage: '76,420 km',
  },
];

export const ordersSeed: WorkOrder[] = [
  {
    id: 'OT-00125',
    vehicleId: 'v1',
    problem: 'Revisión de frenos y cambio de aceite',
    diagnosis: 'Pastillas delanteras con desgaste irregular. Cambio de aceite recomendado.',
    status: 'EN_PROCESO',
    priority: 'ALTA',
    createdAt: 'Hoy, 8:15 a. m.',
    due: 'Hoy, 4:30 p. m.',
    tasks: [
      { id: 't1', title: 'Inspección de frenos', mechanic: 'Carlos', status: 'EN_PROCESO' },
      { id: 't2', title: 'Cambio de aceite y filtro', mechanic: 'Carlos', status: 'ASIGNADA' },
    ],
  },
  {
    id: 'OT-00124',
    vehicleId: 'v2',
    problem: 'Ruido en suspensión delantera',
    diagnosis: 'Buje delantero deteriorado; se solicitó repuesto.',
    status: 'ESPERANDO_REPUESTO',
    priority: 'NORMAL',
    createdAt: 'Ayer, 2:40 p. m.',
    due: 'Mañana, 11:00 a. m.',
    tasks: [
      {
        id: 't3',
        title: 'Solicitar buje delantero',
        mechanic: 'José',
        status: 'PAUSADA',
        note: 'Esperando entrega del proveedor.',
      },
      { id: 't4', title: 'Instalar buje y probar', mechanic: 'José', status: 'PENDIENTE' },
    ],
  },
  {
    id: 'OT-00123',
    vehicleId: 'v3',
    problem: 'Mantenimiento preventivo de 10,000 km',
    diagnosis: 'Sin fallas relevantes. Mantenimiento completado.',
    status: 'LISTA',
    priority: 'NORMAL',
    createdAt: 'Ayer, 9:10 a. m.',
    due: 'Hoy, 2:00 p. m.',
    tasks: [
      { id: 't5', title: 'Cambio de aceite', mechanic: 'José', status: 'COMPLETADA' },
      { id: 't6', title: 'Prueba de carretera', mechanic: 'José', status: 'COMPLETADA' },
    ],
  },
  {
    id: 'OT-00121',
    vehicleId: 'v4',
    problem: 'Diagnóstico de luz de motor',
    diagnosis: 'Sensor de oxígeno con lectura intermitente.',
    status: 'ENTREGADA',
    priority: 'BAJA',
    createdAt: '12 ago.',
    due: '13 ago.',
    tasks: [
      { id: 't7', title: 'Escaneo OBD y diagnóstico', mechanic: 'Carlos', status: 'COMPLETADA' },
    ],
  },
];

export const partsSeed: Part[] = [
  { id: 'p1', name: 'Aceite 5W-30', code: 'LUB-530', stock: 14, minimum: 5, location: 'Estante A-1', unit: 'L' },
  { id: 'p2', name: 'Pastilla de freno delantera', code: 'FRE-101', stock: 2, minimum: 4, location: 'Estante B-3', unit: 'juego' },
  { id: 'p3', name: 'Filtro de aceite', code: 'FIL-022', stock: 7, minimum: 5, location: 'Estante A-2', unit: 'unidad' },
  { id: 'p4', name: 'Buje delantero Accent', code: 'SUS-220', stock: 0, minimum: 2, location: 'Estante C-4', unit: 'unidad' },
];

export const toolsSeed: Tool[] = [
  {
    id: 'h1',
    name: 'Scanner OBD-II',
    code: 'HER-001',
    status: 'ASIGNADA',
    location: 'Gabinete técnico',
    assignee: 'Carlos',
    orderId: 'OT-00125',
  },
  { id: 'h2', name: 'Torquímetro 1/2"', code: 'HER-014', status: 'DISPONIBLE', location: 'Panel A' },
  { id: 'h3', name: 'Gato hidráulico 3T', code: 'HER-021', status: 'MANTENIMIENTO', location: 'Área de mantenimiento' },
  { id: 'h4', name: 'Multímetro digital', code: 'HER-033', status: 'DISPONIBLE', location: 'Gabinete eléctrico' },
];

export const eventsSeed: Event[] = [
  {
    id: 'e1',
    title: 'OT-00125 inició reparación',
    detail: 'Carlos inició la tarea “Inspección de frenos”.',
    date: 'Hoy, 9:05 a. m.',
    kind: 'tarea',
  },
  {
    id: 'e2',
    title: 'OT-00124 espera repuesto',
    detail: 'José indicó espera de buje delantero.',
    date: 'Hoy, 8:40 a. m.',
    kind: 'orden',
  },
  {
    id: 'e3',
    title: 'Stock bajo detectado',
    detail: 'Pastilla de freno delantera: 2 juegos disponibles.',
    date: 'Hoy, 8:00 a. m.',
    kind: 'inventario',
  },
];

export const businessesSeed: LocalBusiness[] = [
  { code: 'ANGELES-4K7P', name: 'Los Ángeles Mecánica Automotríz', managerName: 'Ángel Martínez' },
];

export const profilesSeed: LocalProfile[] = [
  { id: 'u1', name: 'Ángel Martínez', pin: '1234', role: 'ENCARGADO', businessCode: 'ANGELES-4K7P' },
  { id: 'u2', name: 'Carlos', pin: '1234', role: 'MECANICO', businessCode: 'ANGELES-4K7P' },
];

export const LOCAL_PROFILES_KEY = 'automanager.local-profiles.v1';
export const LOCAL_BUSINESSES_KEY = 'automanager.local-businesses.v1';
export const LOCAL_ACTIVE_USER_KEY = 'automanager.active-user.v1';

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const map: Partial<Record<OrderStatus, OrderStatus>> = {
    RECIBIDA: 'DIAGNOSTICO',
    DIAGNOSTICO: 'PLANIFICADA',
    PLANIFICADA: 'EN_PROCESO',
    ESPERANDO_REPUESTO: 'EN_PROCESO',
    EN_PROCESO: 'EN_REVISION',
    EN_REVISION: 'LISTA',
    LISTA: 'ENTREGADA',
  };
  return map[status] ?? null;
}

export function colorFor(status: OrderStatus | TaskStatus | ToolStatus): string {
  if (status === 'LISTA' || status === 'ENTREGADA' || status === 'COMPLETADA' || status === 'DISPONIBLE') {
    return C.green;
  }
  if (status === 'ESPERANDO_REPUESTO' || status === 'PAUSADA' || status === 'MANTENIMIENTO') {
    return C.amber;
  }
  if (status === 'CANCELADA') {
    return C.red;
  }
  if (status === 'EN_PROCESO') {
    return C.blue;
  }
  return C.muted;
}

export function displayStatus(status: OrderStatus | TaskStatus | ToolStatus): string {
  return (
    orderLabel[status as OrderStatus] ??
    taskLabel[status as TaskStatus] ??
    toolLabel[status as ToolStatus] ??
    status
  );
}
