import { useEffect, useState } from 'react';
import { CheckCircle2, Database, ExternalLink, Key, Link2, X } from 'lucide-react';
import { clearSupabaseConfig, getSupabaseConfig, saveSupabaseConfig } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ visible, onClose }: SupabaseConfigModalProps) {
  const current = getSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const cleanUrl = (val: string) => {
    let u = val.trim();
    if (u.includes('=')) u = u.split('=').pop() || '';
    return u.replace(/^["']|["']$/g, '').trim();
  };

  const cleanKey = (val: string) => {
    let k = val.trim();
    if (k.includes('=')) k = k.split('=').pop() || '';
    return k.replace(/^["']|["']$/g, '').trim();
  };

  const handleTest = async () => {
    setErrorMsg(null);
    setTestResult(null);

    const targetUrl = cleanUrl(url);
    const targetKey = cleanKey(key);

    if (!targetUrl.startsWith('https://') || !targetUrl.includes('.supabase.co')) {
      setErrorMsg('La URL del proyecto debe ser en formato: https://TU_ID.supabase.co');
      return;
    }

    if (targetKey.length < 20) {
      setErrorMsg('La clave anon o publicable debe tener al menos 20 caracteres.');
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch(`${targetUrl}/rest/v1/businesses?select=*&limit=1`, {
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`,
        },
      });

      if (res.ok) {
        setTestResult({
          success: true,
          msg: '¡Conexión exitosa! Las credenciales y la base de datos responden correctamente.',
        });
      } else {
        const errorBody = await res.json().catch(() => ({ message: res.statusText }));
        setTestResult({
          success: false,
          msg: `Error (${res.status}): ${errorBody.message || 'Credenciales inválidas'}`,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        msg: `Error de red: ${err instanceof Error ? err.message : 'No se pudo conectar con el servidor'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetUrl = cleanUrl(url);
    const targetKey = cleanKey(key);

    if (!targetUrl.startsWith('https://') || !targetUrl.includes('.supabase.co')) {
      setErrorMsg('La URL del proyecto debe ser en formato: https://TU_ID.supabase.co');
      return;
    }

    if (!targetKey && current.isConfigured) {
      // Keep existing key
      saveSupabaseConfig(targetUrl, current.key);
      return;
    }

    if (targetKey.length < 20) {
      setErrorMsg('La clave anon o publicable debe tener al menos 20 caracteres.');
      return;
    }

    saveSupabaseConfig(targetUrl, targetKey);
  };

  const handleDisconnect = () => {
    if (confirm('¿Desconectar Supabase y volver al modo local de demostración?')) {
      clearSupabaseConfig();
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5EAF0] overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F6F8FB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/20 text-[#137B4B] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0B2545]">
              Configurar Servidor Supabase
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

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              current.isConfigured
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {current.isConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Conectado a la nube ({current.url})</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Modo Local (sin conexión a base de datos en la nube)</span>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Project URL *</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              required
            />
            <p className="text-[11px] text-[#697586] mt-1">
              Encuéntrala en Supabase &gt; Project Settings &gt; API &gt; Project URL.
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-gray-400" />
              <span>Project API Key (anon / publicable) *</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={current.isConfigured ? 'Dejar en blanco para no cambiar' : 'eyJhbGciOi...'}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              required={!current.isConfigured}
            />
            <p className="text-[11px] text-[#697586] mt-1">
              Usa la clave <strong>anon / public</strong> (nunca service_role).
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold ${
                testResult.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.msg}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#F6F8FB] border border-[#E5EAF0] text-xs text-[#536174] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#192235]">Base de datos:</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#1264A3] hover:underline font-bold inline-flex items-center gap-1"
              >
                Abrir Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px]">
              Recuerda ejecutar el archivo <code>supabase/SCHEMA_COMPLETO.sql</code> en el SQL Editor
              de tu proyecto para crear las tablas necesarias.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EAF0]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#1264A3] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? 'Probando...' : '🔍 Probar Conexión'}
              </button>

              {current.isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer ml-1"
                >
                  Desconectar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-xs transition-colors cursor-pointer"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
