import { Cloud, LogOut } from 'lucide-react';
import type { Role } from '../types';

interface HeaderProps {
  businessName: string;
  userName: string;
  role: Role | null;
  cloudSyncStatus: string;
  onLogout: () => void;
}

export function Header({
  businessName,
  userName,
  role,
  cloudSyncStatus,
  onLogout,
}: HeaderProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5EAF0] px-4 sm:px-6 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and workshop name */}
        <div className="flex items-center gap-3">
          <img
            src="./automanager-logo.jpeg"
            alt="Logo AutoManager"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-contain bg-white border border-[#E5EAF0] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0B2545] text-lg sm:text-xl tracking-tight">
                AutoManager
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E9F1F9] text-[#1264A3]">
                Web
              </span>
            </div>
            <p className="text-xs text-[#697586] font-medium truncate max-w-[180px] sm:max-w-xs">
              {businessName}
            </p>
          </div>
        </div>

        {/* Status & User */}
        <div className="flex items-center gap-3">
          {cloudSyncStatus && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9F1F9] text-[#0B4F85] text-xs font-semibold">
              <Cloud className="w-3.5 h-3.5 animate-pulse" />
              <span>{cloudSyncStatus}</span>
            </div>
          )}

          {role && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-[#192235]">{userName}</p>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    role === 'ENCARGADO'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {role === 'ENCARGADO' ? 'Gerente / Encargado' : 'Mecánico'}
                </span>
              </div>
              <div
                title={`${userName} (${role})`}
                className="w-9 h-9 rounded-full bg-[#DDEAF7] text-[#0B4F85] flex items-center justify-center font-extrabold text-xs shadow-xs"
              >
                {initials}
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
