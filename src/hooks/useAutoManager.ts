import { useEffect, useMemo, useRef, useState } from 'react';

import {
  businessesSeed,
  eventsSeed,
  LOCAL_ACTIVE_USER_KEY,
  LOCAL_BUSINESSES_KEY,
  LOCAL_PROFILES_KEY,
  nextStatus,
  ordersSeed,
  partsSeed,
  profilesSeed,
  toolsSeed,
  vehiclesSeed,
} from '../data/seed';
import { isPrototypeState, loadLocal, saveLocal, workspaceCacheKey } from '../lib/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  Event,
  LocalBusiness,
  LocalProfile,
  Part,
  Priority,
  PrototypeState,
  Role,
  TaskStatus,
  Tool,
  Vehicle,
  WorkOrder,
} from '../types';

export function useAutoManager() {
  // --- Auth & Profiles ---
  const [profiles, setProfiles] = useState<LocalProfile[]>(() =>
    loadLocal(LOCAL_PROFILES_KEY, profilesSeed)
  );
  const [businesses, setBusinesses] = useState<LocalBusiness[]>(() =>
    loadLocal(LOCAL_BUSINESSES_KEY, businessesSeed)
  );

  const initialLocalProfile = useMemo(() => {
    return loadLocal<LocalProfile | null>(LOCAL_ACTIVE_USER_KEY, profiles[0] ?? null);
  }, [profiles]);

  const [role, setRole] = useState<Role | null>(() => initialLocalProfile?.role ?? null);
  const [userName, setUserName] = useState<string>(
    () => initialLocalProfile?.name ?? 'Ángel Martínez'
  );
  const [businessName, setBusinessName] = useState<string>(() => {
    const b = businesses.find((item) => item.code === initialLocalProfile?.businessCode);
    return b?.name ?? 'Los Ángeles Mecánica Automotríz';
  });
  const [businessCode, setBusinessCode] = useState<string>(
    () => initialLocalProfile?.businessCode ?? 'ANGELES-4K7P'
  );

  // Cloud sync status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>('');

  // --- Operational State ---
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadLocal('automanager.vehicles.v1', vehiclesSeed)
  );
  const [orders, setOrders] = useState<WorkOrder[]>(() =>
    loadLocal('automanager.orders.v1', ordersSeed)
  );
  const [parts, setParts] = useState<Part[]>(() =>
    loadLocal('automanager.parts.v1', partsSeed)
  );
  const [tools, setTools] = useState<Tool[]>(() =>
    loadLocal('automanager.tools.v1', toolsSeed)
  );
  const [events, setEvents] = useState<Event[]>(() =>
    loadLocal('automanager.events.v1', eventsSeed)
  );

  // Persist local businesses & profiles
  useEffect(() => {
    saveLocal(LOCAL_PROFILES_KEY, profiles);
  }, [profiles]);

  useEffect(() => {
    saveLocal(LOCAL_BUSINESSES_KEY, businesses);
  }, [businesses]);

  // Always persist operational state to localStorage (offline-first)
  useEffect(() => {
    saveLocal('automanager.vehicles.v1', vehicles);
    saveLocal('automanager.orders.v1', orders);
    saveLocal('automanager.parts.v1', parts);
    saveLocal('automanager.tools.v1', tools);
    saveLocal('automanager.events.v1', events);
  }, [vehicles, orders, parts, tools, events]);

  // Initial load of businesses and profiles from Supabase (without email/auth)
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // Load businesses from Supabase
    supabase
      .from('workshop_businesses')
      .select('code, name, manager_name')
      .then(({ data, error }) => {
        if (!isMounted || error || !data || data.length === 0) return;
        setBusinesses((current) => {
          const map = new Map(current.map((b) => [b.code, b]));
          data.forEach((b: { code: string; name: string; manager_name: string }) => {
            map.set(b.code, {
              code: b.code,
              name: b.name,
              managerName: b.manager_name,
            });
          });
          return Array.from(map.values());
        });
      });

    // Load profiles from Supabase
    supabase
      .from('workshop_profiles')
      .select('id, business_code, name, pin, role')
      .then(({ data, error }) => {
        if (!isMounted || error || !data || data.length === 0) return;
        setProfiles((current) => {
          const map = new Map(current.map((p) => [p.id, p]));
          data.forEach(
            (p: { id: string; business_code: string; name: string; pin: string; role: string }) => {
              map.set(p.id, {
                id: p.id,
                name: p.name,
                pin: p.pin,
                role: p.role as Role,
                businessCode: p.business_code,
              });
            }
          );
          return Array.from(map.values());
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load cloud workshop state when businessCode is active
  const lastCloudState = useRef<string>('');

  const loadCloudState = async (code: string) => {
    if (!supabase || !code) return;
    try {
      const { data, error } = await supabase
        .from('workshop_state')
        .select('state')
        .eq('business_code', code)
        .maybeSingle();

      if (!error && data?.state && isPrototypeState(data.state)) {
        const cloudStateStr = JSON.stringify(data.state);
        // Sólo actualizar si el estado remoto es diferente al local
        if (lastCloudState.current !== cloudStateStr) {
          lastCloudState.current = cloudStateStr;
          setVehicles(data.state.vehicles);
          setOrders(data.state.orders);
          setParts(data.state.parts);
          setTools(data.state.tools);
          setEvents(data.state.events);
          setCloudSyncStatus('Sincronizado con la nube');
        }
      }
    } catch (err) {
      console.warn('Error loading workshop state from Supabase:', err);
    }
  };

  useEffect(() => {
    if (!businessCode) return;
    
    // Carga inicial
    void loadCloudState(businessCode);

    // Fallback: Polling cada 5 segundos para garantizar que sincronice "a como sea" sin necesidad de configurar nada en el dashboard de Supabase
    const interval = setInterval(() => {
      void loadCloudState(businessCode);
    }, 5000);

    // Intento de conexión con Supabase Realtime (si está configurado en el dashboard para la tabla workshop_state)
    let channel: any;
    if (supabase) {
      channel = supabase
        .channel(`workshop_state_${businessCode}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Escuchar todo (INSERT, UPDATE)
            schema: 'public',
            table: 'workshop_state',
            filter: `business_code=eq.${businessCode}`,
          },
          () => {
            void loadCloudState(businessCode);
          }
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessCode]);

  // Auto-sync state changes to Supabase workshop_state (debounced)
  useEffect(() => {
    if (!supabase || !businessCode) return;

    const snapshot: PrototypeState = { vehicles, orders, parts, tools, events };
    const currentStateStr = JSON.stringify(snapshot);

    // Evitar loop infinito: no guardar si el estado actual es idéntico al último que vino de la nube
    if (currentStateStr === lastCloudState.current) {
      return;
    }

    setCloudSyncStatus('Guardando en la nube…');
    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase.from('workshop_state').upsert({
          business_code: businessCode,
          state: snapshot,
          updated_at: new Date().toISOString(),
        });
        if (!error) {
          lastCloudState.current = currentStateStr; // Actualizar nuestro marcador después de guardar con éxito
          setCloudSyncStatus('Guardado en la nube');
        } else {
          setCloudSyncStatus('');
        }
      } catch {
        setCloudSyncStatus('');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [vehicles, orders, parts, tools, events, businessCode]);

  // Log an event
  const addEvent = (title: string, detail: string, kind: Event['kind']) => {
    setEvents((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        detail,
        date: 'Ahora',
        kind,
      },
      ...current,
    ]);
  };


  // --- Operational Actions ---

  const addVehicle = (data: Omit<Vehicle, 'id'>): { success: boolean; message?: string } => {
    const normalizedPlate = data.plate.replaceAll(' ', '').toUpperCase();
    if (
      vehicles.some(
        (vehicle) => vehicle.plate.replaceAll(' ', '').toUpperCase() === normalizedPlate
      )
    ) {
      return { success: false, message: 'Ya existe un vehículo registrado con esta placa.' };
    }
    const item: Vehicle = {
      ...data,
      id: `v${Date.now()}`,
      plate: data.plate.toUpperCase().trim(),
    };
    setVehicles((current) => [item, ...current]);
    addEvent('Vehículo registrado', `${item.plate} fue vinculado a ${item.customer}.`, 'orden');
    return { success: true };
  };

  const addOrder = (
    plate: string,
    problem: string,
    priority: Priority
  ): { success: boolean; message?: string } => {
    const vehicle = vehicles.find(
      (item) => item.plate.replaceAll(' ', '').toUpperCase() === plate.replaceAll(' ', '').toUpperCase()
    );
    if (!vehicle) {
      return { success: false, message: 'Registre el vehículo antes de crear una orden.' };
    }
    if (!problem.trim()) {
      return { success: false, message: 'Indique el problema reportado por el cliente.' };
    }

    const id = `OT-${String(126 + orders.length).padStart(5, '0')}`;
    const newOrder: WorkOrder = {
      id,
      vehicleId: vehicle.id,
      problem: problem.trim(),
      status: 'RECIBIDA',
      priority,
      createdAt: 'Ahora',
      due: 'Por definir',
      tasks: [],
    };

    setOrders((current) => [newOrder, ...current]);
    addEvent(`${id} recibida`, `${vehicle.plate}: ${problem.trim()}`, 'orden');
    return { success: true };
  };

  const advanceOrder = (id: string): { success: boolean; message?: string } => {
    const order = orders.find((item) => item.id === id);
    if (!order) return { success: false, message: 'Orden no encontrada.' };

    const next = nextStatus(order.status);
    if (!next) {
      return { success: false, message: 'La orden no puede avanzar desde este estado.' };
    }

    if (next === 'EN_REVISION' && order.tasks.some((task) => task.status !== 'COMPLETADA')) {
      return {
        success: false,
        message: 'Complete todas las tareas antes de enviar la orden a revisión.',
      };
    }

    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status: next } : item))
    );
    addEvent(`${id} avanzó a ${next}`, `El estado cambió a ${next}.`, 'orden');
    return { success: true };
  };

  const waitPart = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'ESPERANDO_REPUESTO' } : item))
    );
    addEvent(`${id}: esperando repuesto`, 'Se registró un bloqueo por material pendiente.', 'orden');
  };

  const updateTask = (orderIdToUpdate: string, taskId: string, status: TaskStatus) => {
    const order = orders.find((item) => item.id === orderIdToUpdate);
    const task = order?.tasks.find((item) => item.id === taskId);
    if (!order || !task) return;

    setOrders((current) =>
      current.map((item) =>
        item.id !== orderIdToUpdate
          ? item
          : {
              ...item,
              tasks: item.tasks.map((taskItem) =>
                taskItem.id === taskId ? { ...taskItem, status } : taskItem
              ),
            }
      )
    );
    addEvent(`${orderIdToUpdate}: ${task.title}`, `${userName} actualizó la tarea a ${status}.`, 'tarea');
  };

  const addTask = (orderIdToUpdate: string, title: string): boolean => {
    if (!title.trim()) return false;
    setOrders((current) =>
      current.map((item) =>
        item.id !== orderIdToUpdate
          ? item
          : {
              ...item,
              tasks: [
                ...item.tasks,
                {
                  id: `t${Date.now()}`,
                  title: title.trim(),
                  mechanic: role === 'MECANICO' ? userName : 'Carlos',
                  status: 'ASIGNADA',
                },
              ],
            }
      )
    );
    addEvent(`${orderIdToUpdate}: tarea asignada`, `${title.trim()} fue asignada.`, 'tarea');
    return true;
  };

  const consume = (id: string): { success: boolean; message?: string } => {
    const part = parts.find((item) => item.id === id);
    if (!part) return { success: false, message: 'Repuesto no encontrado.' };
    if (part.stock === 0) {
      return { success: false, message: 'No se puede registrar salida con stock cero.' };
    }
    setParts((current) =>
      current.map((item) => (item.id === id ? { ...item, stock: item.stock - 1 } : item))
    );
    addEvent(
      `Salida de ${part.name}`,
      `Se descontó 1 ${part.unit}. Stock restante: ${part.stock - 1}.`,
      'inventario'
    );
    return { success: true };
  };

  const receive = (id: string) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;
    setParts((current) =>
      current.map((item) => (item.id === id ? { ...item, stock: item.stock + 1 } : item))
    );
    addEvent(
      `Entrada de ${part.name}`,
      `Se agregó 1 ${part.unit}. Stock actual: ${part.stock + 1}.`,
      'inventario'
    );
  };

  const toggleTool = (id: string) => {
    const tool = tools.find((item) => item.id === id);
    if (!tool || tool.status === 'MANTENIMIENTO') return;
    const lend = tool.status === 'DISPONIBLE';

    const activeOrder = orders.find(
      (order) => !['ENTREGADA', 'CANCELADA'].includes(order.status)
    );

    setTools((current) =>
      current.map((item) =>
        item.id !== id
          ? item
          : lend
            ? {
                ...item,
                status: 'ASIGNADA',
                assignee: userName,
                orderId: activeOrder?.id,
              }
            : {
                ...item,
                status: 'DISPONIBLE',
                assignee: undefined,
                orderId: undefined,
              }
      )
    );

    addEvent(
      lend ? `${tool.name} prestada` : `${tool.name} devuelta`,
      lend ? `${userName} registró el préstamo.` : `${userName} registró la devolución.`,
      'herramienta'
    );
  };

  // --- Auth Handlers ---

  // --- Auth Handlers ---

  const loginLocal = (profile: LocalProfile) => {
    const business = businesses.find((item) => item.code === profile.businessCode);
    setRole(profile.role);
    setUserName(profile.name);
    setBusinessName(business?.name ?? 'Negocio local');
    setBusinessCode(profile.businessCode);
    saveLocal(LOCAL_ACTIVE_USER_KEY, profile);
    void loadCloudState(profile.businessCode);
  };

  const registerBusinessLocal = (
    name: string,
    managerName: string,
    pin: string
  ): LocalProfile | null => {
    const normalized = name.trim();
    if (!normalized || !managerName.trim() || pin.length !== 4) return null;

    const prefix =
      normalized.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, '').slice(0, 8).toUpperCase() || 'NEGOCIO';
    let code = `${prefix}-4K7P`;
    let counter = 2;
    while (businesses.some((b) => b.code === code)) {
      code = `${prefix}-${String(counter).padStart(4, '0')}`;
      counter += 1;
    }

    const profile: LocalProfile = {
      id: `u${Date.now()}`,
      name: managerName.trim(),
      pin,
      role: 'ENCARGADO',
      businessCode: code,
    };

    setBusinesses((current) => [
      ...current,
      { code, name: normalized, managerName: managerName.trim() },
    ]);
    setProfiles((current) => [...current, profile]);
    loginLocal(profile);

    // Persist to Supabase workshop tables
    if (supabase) {
      void supabase.from('workshop_businesses').insert({
        code,
        name: normalized,
        manager_name: managerName.trim(),
      });
      void supabase.from('workshop_profiles').insert({
        id: profile.id,
        business_code: code,
        name: profile.name,
        pin: profile.pin,
        role: profile.role,
      });
      void supabase.from('workshop_state').insert({
        business_code: code,
        state: { vehicles, orders, parts, tools, events },
      });
    }

    return profile;
  };

  const registerWorkerLocal = (
    name: string,
    pin: string,
    code: string,
    workerRole: Role
  ): LocalProfile | null => {
    const normalizedCode = code.trim().toUpperCase();
    if (
      !businesses.some((b) => b.code === normalizedCode) ||
      !name.trim() ||
      pin.length !== 4
    ) {
      return null;
    }

    const profile: LocalProfile = {
      id: `u${Date.now()}`,
      name: name.trim(),
      pin,
      role: workerRole,
      businessCode: normalizedCode,
    };

    setProfiles((current) => [...current, profile]);
    loginLocal(profile);

    // Persist to Supabase workshop_profiles
    if (supabase) {
      void supabase.from('workshop_profiles').insert({
        id: profile.id,
        business_code: normalizedCode,
        name: profile.name,
        pin: profile.pin,
        role: profile.role,
      });
    }

    return profile;
  };

  const cloudSignIn = async (): Promise<{ error?: string }> => ({});
  const cloudSignUp = async (): Promise<{ error?: string; message?: string }> => ({});
  const cloudCreateBusiness = async (): Promise<{ error?: string }> => ({});
  const cloudJoinBusiness = async (): Promise<{ error?: string }> => ({});

  const logout = () => {
    setRole(null);
    saveLocal(LOCAL_ACTIVE_USER_KEY, null);
  };


  const resetToSeedData = () => {
    setVehicles(vehiclesSeed);
    setOrders(ordersSeed);
    setParts(partsSeed);
    setTools(toolsSeed);
    setEvents(eventsSeed);
    saveLocal('automanager.vehicles.v1', vehiclesSeed);
    saveLocal('automanager.orders.v1', ordersSeed);
    saveLocal('automanager.parts.v1', partsSeed);
    saveLocal('automanager.tools.v1', toolsSeed);
    saveLocal('automanager.events.v1', eventsSeed);
  };

  // --- Derived states ---
  const activeOrders = useMemo(
    () => orders.filter((order) => !['ENTREGADA', 'CANCELADA'].includes(order.status)),
    [orders]
  );

  const lowStock = useMemo(
    () => parts.filter((part) => part.stock <= part.minimum),
    [parts]
  );

  const urgentOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.priority === 'ALTA' || order.status === 'ESPERANDO_REPUESTO'
      ),
    [orders]
  );

  return {
    // Auth & Info
    role,
    userName,
    businessName,
    businessCode,
    profiles,
    businesses,
    isCloud: isSupabaseConfigured,
    cloudSession: null,
    cloudLoading: false,
    cloudSyncStatus,



    // Data
    vehicles,
    orders,
    parts,
    tools,
    events,
    activeOrders,
    lowStock,
    urgentOrders,

    // Actions
    addVehicle,
    addOrder,
    advanceOrder,
    waitPart,
    updateTask,
    addTask,
    consume,
    receive,
    toggleTool,
    resetToSeedData,

    // Auth actions
    loginLocal,
    registerBusinessLocal,
    registerWorkerLocal,
    cloudSignIn,
    cloudSignUp,
    cloudCreateBusiness,
    cloudJoinBusiness,
    logout,
  };
}
