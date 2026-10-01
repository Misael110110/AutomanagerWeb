import {
  Car,
  ClipboardList,
  Home,
  LayoutGrid,
  Package,
} from 'lucide-react';
import type { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  ordersBadge?: number;
  inventoryBadge?: number;
}

export function Navigation({
  activeTab,
  onChangeTab,
  ordersBadge = 0,
  inventoryBadge = 0,
}: NavigationProps) {
  const tabs: Array<{ id: Tab; label: string; icon: typeof Home; badge?: number }> = [
    { id: 'Inicio', label: 'Inicio', icon: Home },
    { id: 'Órdenes', label: 'Órdenes', icon: ClipboardList, badge: ordersBadge },
    { id: 'Vehículos', label: 'Vehículos', icon: Car },
    { id: 'Inventario', label: 'Inventario', icon: Package, badge: inventoryBadge },
    { id: 'Más', label: 'Más', icon: LayoutGrid },
  ];

  return (
    <>
      {/* Desktop / Tablet Bar */}
      <nav className="hidden sm:block bg-white border-b border-[#E5EAF0]">
        <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-colors cursor-pointer relative ${
                    isActive
                      ? 'border-[#1264A3] text-[#1264A3] bg-[#E9F1F9]/50'
                      : 'border-transparent text-[#697586] hover:text-[#192235] hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1264A3]' : 'text-[#697586]'}`} />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        tab.id === 'Inventario'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#1264A3] text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5EAF0] shadow-lg pb-safe">
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex flex-col items-center justify-center relative cursor-pointer ${
                  isActive ? 'text-[#1264A3]' : 'text-[#697586]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1264A3]' : 'text-[#697586]'}`} />
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 text-[9px] px-1 py-0.2 rounded-full font-extrabold leading-tight ${
                        tab.id === 'Inventario'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#1264A3] text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 ${
                    isActive ? 'font-extrabold text-[#1264A3]' : 'font-medium'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
