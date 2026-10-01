import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { LocalProfile, Role } from '../../types';

interface AuthModalProps {
  isCloud: boolean;
  profiles: LocalProfile[];
  onLoginLocal: (profile: LocalProfile) => void;
  onRegisterBusinessLocal: (name: string, managerName: string, pin: string) => LocalProfile | null;
  onRegisterWorkerLocal: (name: string, pin: string, code: string, role: Role) => LocalProfile | null;
  onCloudSignIn?: (email: string, pass: string) => Promise<{ error?: string }>;
  onCloudSignUp?: (name: string, email: string, pass: string) => Promise<{ error?: string; message?: string }>;
  onOpenSupabaseConfig?: () => void;
}

type LocalAuthMode = 'LOGIN' | 'BUSINESS' | 'WORKER';

export function AuthModal({
  isCloud,
  profiles,
  onLoginLocal,
  onRegisterBusinessLocal,
  onRegisterWorkerLocal,
  onCloudSignIn,
  onCloudSignUp,
  onOpenSupabaseConfig,
}: AuthModalProps) {
  // Local state
  const [localMode, setLocalMode] = useState<LocalAuthMode>('LOGIN');
  const [name, setName] = useState('Ángel Martínez');
  const [pin, setPin] = useState('1234');
  const [businessCode, setBusinessCode] = useState('ANGELES-4K7P');
  const [businessName, setBusinessName] = useState('');
  const [workerRole, setWorkerRole] = useState<Role>('MECANICO');

  // Cloud state
  const [cloudMode, setCloudMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudFullName, setCloudFullName] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const profile = profiles.find(
      (item) =>
        item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        item.pin === pin &&
        item.businessCode === businessCode.trim().toUpperCase()
    );

    if (!profile) {
      setErrorMsg('No encontramos la cuenta. Revise el nombre, PIN (1234) y código de taller.');
      return;
    }
    onLoginLocal(profile);
  };

  const handleQuickLogin = (p: LocalProfile) => {
    setErrorMsg(null);
    onLoginLocal(p);
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const profile = onRegisterBusinessLocal(businessName, name, pin);
    if (!profile) {
      setErrorMsg('Escriba el nombre del taller, su nombre de gerente y un PIN de 4 dígitos.');
      return;
    }
  };

  const handleJoinWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const profile = onRegisterWorkerLocal(name, pin, businessCode, workerRole);
    if (!profile) {
      setErrorMsg('Verifique que el código exista e indique nombre y PIN de 4 dígitos.');
      return;
    }
  };

  const handleCloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (cloudMode === 'LOGIN') {
      if (!onCloudSignIn) return;
      const res = await onCloudSignIn(cloudEmail, cloudPassword);
      if (res.error) setErrorMsg(res.error);
    } else {
      if (!onCloudSignUp) return;
      const res = await onCloudSignUp(cloudFullName, cloudEmail, cloudPassword);
      if (res.error) setErrorMsg(res.error);
      if (res.message) setSuccessMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2545]/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Hero Header */}
        <div className="p-6 bg-gradient-to-b from-[#0B2545] to-[#1264A3] text-white text-center">
          <img
            src="./automanager-logo.jpeg"
            alt="Logo"
            className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-white p-1 border-2 border-white/20 shadow-md object-contain"
          />
          <h2 className="text-2xl font-black tracking-tight">AutoManager</h2>
          <p className="text-blue-100 text-xs mt-1">Control · Organiza · Optimiza</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isCloud ? (
            /* Cloud Auth */
            <form onSubmit={handleCloudSubmit} className="space-y-4">
              <div className="flex rounded-xl bg-gray-100 p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setCloudMode('LOGIN')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                    cloudMode === 'LOGIN' ? 'bg-white text-[#1264A3] shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setCloudMode('REGISTER')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                    cloudMode === 'REGISTER'
                      ? 'bg-white text-[#1264A3] shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              {cloudMode === 'REGISTER' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={cloudFullName}
                    onChange={(e) => setCloudFullName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={cloudEmail}
                  onChange={(e) => setCloudEmail(e.target.value)}
                  placeholder="taller@ejemplo.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={cloudPassword}
                  onChange={(e) => setCloudPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-md transition-all cursor-pointer mt-2"
              >
                {cloudMode === 'LOGIN' ? 'Entrar a AutoManager' : 'Crear cuenta en la nube'}
              </button>
            </form>
          ) : (
            /* Local Auth (Demo Mode) */
            <div className="space-y-4">
              {localMode === 'LOGIN' ? (
                <form onSubmit={handleLocalLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Ángel Martínez o Carlos"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Código de taller / negocio
                    </label>
                    <input
                      type="text"
                      value={businessCode}
                      onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                      placeholder="Ej. ANGELES-4K7P"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl uppercase font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      PIN de acceso (4 dígitos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl tracking-widest text-center font-black focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-md transition-all cursor-pointer"
                  >
                    Entrar a AutoManager
                  </button>

                  {/* Demo Quick Access */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
                      Acceso rápido de demostración:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {profiles.slice(0, 2).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleQuickLogin(p)}
                          className="px-2.5 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 text-left cursor-pointer transition-colors"
                        >
                          <p className="text-xs font-bold text-[#192235]">{p.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {p.role === 'ENCARGADO' ? 'Gerente' : 'Mecánico'} (PIN: {p.pin})
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-1.5 text-xs text-[#1264A3]">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMode('BUSINESS');
                        setErrorMsg(null);
                      }}
                      className="font-bold hover:underline cursor-pointer"
                    >
                      Soy gerente: crear nuevo taller local
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMode('WORKER');
                        setErrorMsg(null);
                      }}
                      className="font-bold hover:underline cursor-pointer"
                    >
                      Soy trabajador: unirme con código
                    </button>
                    {onOpenSupabaseConfig && (
                      <button
                        type="button"
                        onClick={onOpenSupabaseConfig}
                        className="mt-2 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        ⚙️ Configurar Servidor Supabase
                      </button>
                    )}
                  </div>
                </form>
              ) : localMode === 'BUSINESS' ? (
                /* Create business */
                <form onSubmit={handleCreateBusiness} className="space-y-4">
                  <h3 className="font-extrabold text-[#0B2545] text-sm">
                    Crear nuevo taller mecánico
                  </h3>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Nombre del taller
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej. Taller Hermanos Pérez"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Nombre del encargado / gerente
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      PIN de 4 dígitos
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl text-center font-black tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-md transition-all cursor-pointer"
                  >
                    Crear taller y entrar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalMode('LOGIN');
                      setErrorMsg(null);
                    }}
                    className="w-full text-center text-xs font-bold text-[#1264A3] hover:underline cursor-pointer"
                  >
                    Volver a inicio de sesión
                  </button>
                </form>
              ) : (
                /* Join as worker */
                <form onSubmit={handleJoinWorker} className="space-y-4">
                  <h3 className="font-extrabold text-[#0B2545] text-sm">
                    Unirse a un taller existente
                  </h3>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Código del taller
                    </label>
                    <input
                      type="text"
                      value={businessCode}
                      onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                      placeholder="Ej. ANGELES-4K7P"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl uppercase font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre del trabajador"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Tu PIN personal (4 dígitos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl text-center font-black tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                      Rol solicitado
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkerRole('MECANICO')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                          workerRole === 'MECANICO'
                            ? 'bg-blue-50 border-[#1264A3] text-[#1264A3]'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        <p className="font-extrabold">Mecánico</p>
                        <p className="text-[10px] text-gray-500">Actualiza sus tareas</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkerRole('ENCARGADO')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                          workerRole === 'ENCARGADO'
                            ? 'bg-blue-50 border-[#1264A3] text-[#1264A3]'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        <p className="font-extrabold">Encargado</p>
                        <p className="text-[10px] text-gray-500">Gestiona órdenes</p>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-md transition-all cursor-pointer"
                  >
                    Registrar perfil y entrar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalMode('LOGIN');
                      setErrorMsg(null);
                    }}
                    className="w-full text-center text-xs font-bold text-[#1264A3] hover:underline cursor-pointer"
                  >
                    Volver a inicio de sesión
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
