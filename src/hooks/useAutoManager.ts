import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
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

  // Cloud auth & sync states
  const [cloudSession, setCloudSession] = useState<Session | null>(null);
  const [cloudLoading, setCloudLoading] = useState(isSupabaseConfigured);
  const [cloudBusinessId, setCloudBusinessId] = useState<string | null>(null);
  const [cloudStateReady, setCloudStateReady] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>('');
  const cloudSaveError = useRef<string | null>(null);

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

  // Persist operational state to localStorage when in local mode
  useEffect(() => {
    if (!cloudSession) {
      saveLocal('automanager.vehicles.v1', vehicles);
      saveLocal('automanager.orders.v1', orders);
      saveLocal('automanager.parts.v1', parts);
      saveLocal('automanager.tools.v1', tools);
      saveLocal('automanager.events.v1', events);
    }
  }, [vehicles, orders, parts, tools, events, cloudSession]);

  // Supabase Auth listener
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setCloudSession(data.session);
      setCloudLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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

  // Load cloud workspace when session is present
  const loadCloudWorkspace = async (session: Session) => {
    if (!supabase) return;
    setCloudLoading(true);
    setCloudStateReady(false);

    const fallbackName = String(
      session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'Usuario'
    );

    try {
      const [{ data: profile }, { data: membership, error }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle(),
        supabase
          .from('memberships')
          .select('business_id, role, businesses(name, join_code)')
          .eq('user_id', session.user.id)
          .eq('status', 'ACTIVO')
          .limit(1)
          .maybeSingle(),
      ]);

      setUserName(profile?.full_name ?? fallbackName);

      if (error) {
        console.error('Error opening workspace:', error.message);
      }

      type MembershipData = {
        business_id: string;
        role: Role;
        businesses: { name: string; join_code: string } | null;
      };

      const workspace = membership as unknown as MembershipData | null;

      if (workspace?.businesses) {
        setRole(workspace.role);
        setBusinessName(workspace.businesses.name);
        setBusinessCode(workspace.businesses.join_code);
        setCloudBusinessId(workspace.business_id);

        // Try to load cached local workspace
        const cache = loadLocal<Partial<PrototypeState> | undefined>(
          workspaceCacheKey(workspace.business_id),
          undefined
        );
        if (isPrototypeState(cache)) {
          setOrders(cache.orders);
          setVehicles(cache.vehicles);
          setParts(cache.parts);
          setTools(cache.tools);
          setEvents(cache.events);
          setCloudSyncStatus('Caché local; sincronizando nube…');
        }

        // Fetch from Supabase prototype_state table
        const { data: stored, error: stateError } = await supabase
          .from('prototype_state')
          .select('state')
          .eq('business_id', workspace.business_id)
          .maybeSingle();

        if (stateError && stateError.code !== 'PGRST116') {
          console.warn('Error reading saved state:', stateError.message);
        }

        const saved = stored?.state as Partial<PrototypeState> | undefined;
        if (isPrototypeState(saved)) {
          setOrders(saved.orders);
          setVehicles(saved.vehicles);
          setParts(saved.parts);
          setTools(saved.tools);
          setEvents(saved.events);
          setCloudSyncStatus('Trabajo recuperado de la nube');
        }
        setCloudStateReady(true);
      } else {
        // Do not kick user out if they are logged in locally
        setCloudBusinessId(null);
      }

    } catch (e) {
      console.error('Exception loading workspace:', e);
    } finally {
      setCloudLoading(false);
    }
  };

  useEffect(() => {
    if (cloudSession) {
      void loadCloudWorkspace(cloudSession);
    }
  }, [cloudSession]);

  // Cloud sync effect
  useEffect(() => {
    if (!supabase || !cloudSession || !cloudBusinessId || !cloudStateReady) return;

    const client = supabase;
    const snapshot: PrototypeState = { vehicles, orders, parts, tools, events };

    saveLocal(workspaceCacheKey(cloudBusinessId), snapshot);
    setCloudSyncStatus('Guardando…');

    const timeout = setTimeout(() => {
      void (async () => {
        try {
          const { error } = await client.from('prototype_state').upsert(
            {
              business_id: cloudBusinessId,
              state: snapshot,
              updated_by: cloudSession.user.id,
            },
            { onConflict: 'business_id' }
          );

          if (error && cloudSaveError.current !== error.message) {
            cloudSaveError.current = error.message;
            setCloudSyncStatus('Error al guardar en nube');
          } else if (!error) {
            cloudSaveError.current = null;
            setCloudSyncStatus('Guardado en la nube');
          }
        } catch (err) {
          console.error('Error syncing:', err);
          setCloudSyncStatus('Sin conexión a la nube');
        }
      })();
    }, 500);

    return () => clearTimeout(timeout);
  }, [cloudBusinessId, cloudSession, cloudStateReady, events, orders, parts, tools, vehicles]);

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

  const loginLocal = (profile: LocalProfile) => {
    const business = businesses.find((item) => item.code === profile.businessCode);
    setRole(profile.role);
    setUserName(profile.name);
    setBusinessName(business?.name ?? 'Negocio local');
    setBusinessCode(profile.businessCode);
    saveLocal(LOCAL_ACTIVE_USER_KEY, profile);
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
    return profile;
  };

  const cloudSignIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error) return { error: error.message };
    if (data.session) await loadCloudWorkspace(data.session);
    return {};
  };

  const cloudSignUp = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ error?: string; message?: string }> => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: { data: { full_name: name.trim() } },
    });
    if (error) return { error: error.message };
    if (!data.session) {
      return {
        message: 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.',
      };
    }
    await loadCloudWorkspace(data.session);
    return {};
  };

  const cloudCreateBusiness = async (name: string): Promise<{ error?: string }> => {
    if (!supabase || !cloudSession) return { error: 'Sesión no iniciada.' };
    const { data, error } = await supabase
      .from('businesses')
      .insert({ name: name.trim(), owner_id: cloudSession.user.id, join_code: '' })
      .select('id, name, join_code')
      .single();

    if (error) return { error: error.message };
    setBusinessName(data.name);
    setBusinessCode(data.join_code);
    setCloudBusinessId(data.id);
    setCloudStateReady(true);
    setRole('ENCARGADO');
    return {};
  };

  const cloudJoinBusiness = async (code: string): Promise<{ error?: string }> => {
    if (!supabase || !cloudSession) return { error: 'Sesión no iniciada.' };
    const { error } = await supabase.rpc('join_business_by_code', {
      code: code.trim().toUpperCase(),
      requested_role: 'MECANICO',
    });
    if (error) return { error: error.message };
    await loadCloudWorkspace(cloudSession);
    return {};
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setRole(null);
    setCloudSession(null);
    setCloudBusinessId(null);
    setCloudStateReady(false);
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
    cloudSession,
    cloudLoading,
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
