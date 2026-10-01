import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/modals/AuthModal';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { NewVehicleModal } from './components/modals/NewVehicleModal';
import { OrderDetailModal } from './components/modals/OrderDetailModal';
import { VehicleDetailModal } from './components/modals/VehicleDetailModal';
import { HistoryView } from './components/views/HistoryView';
import { HomeView } from './components/views/HomeView';
import { InventoryView } from './components/views/InventoryView';
import { MoreView } from './components/views/MoreView';
import { OrdersView } from './components/views/OrdersView';
import { ReportsView } from './components/views/ReportsView';
import { TeamView } from './components/views/TeamView';
import { ToolsView } from './components/views/ToolsView';
import { VehiclesView } from './components/views/VehiclesView';
import { useAutoManager } from './hooks/useAutoManager';
import type { MoreView as MoreViewType, Tab } from './types';

export default function App() {
  const {
    role,
    userName,
    businessName,
    profiles,
    isCloud,
    cloudSyncStatus,
    vehicles,
    orders,
    parts,
    tools,
    events,
    activeOrders,
    lowStock,
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
    loginLocal,
    registerBusinessLocal,
    registerWorkerLocal,
    cloudSignIn,
    cloudSignUp,
    logout,
  } = useAutoManager();

  const [activeTab, setActiveTab] = useState<Tab>('Inicio');
  const [moreView, setMoreView] = useState<MoreViewType>('MENU');

  // Modals
  const [newVehicleOpen, setNewVehicleOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) ?? null
    : null;

  const selectedOrderVehicle = selectedOrder
    ? vehicles.find((v) => v.id === selectedOrder.vehicleId) ?? null
    : null;

  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId) ?? null
    : null;

  const selectedVehicleOrders = selectedVehicle
    ? orders.filter((o) => o.vehicleId === selectedVehicle.id)
    : [];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'Más') {
      setMoreView('MENU');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col selection:bg-[#1264A3] selection:text-white">
      {/* Login Modal when unauthenticated */}
      {!role && (
        <AuthModal
          isCloud={isCloud}
          profiles={profiles}
          onLoginLocal={loginLocal}
          onRegisterBusinessLocal={registerBusinessLocal}
          onRegisterWorkerLocal={registerWorkerLocal}
          onCloudSignIn={cloudSignIn}
          onCloudSignUp={cloudSignUp}
        />
      )}

      {/* Header */}
      <Header
        businessName={businessName}
        userName={userName}
        role={role}
        cloudSyncStatus={cloudSyncStatus}
        onLogout={logout}
      />

      {/* Navigation (Desktop Top Bar + Mobile Bottom Bar) */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        ordersBadge={activeOrders.length}
        inventoryBadge={lowStock.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        {activeTab === 'Inicio' && role && (
          <HomeView
            role={role}
            user={userName}
            orders={orders}
            vehicles={vehicles}
            lowStock={lowStock}
            onTab={handleTabChange}
            onOpenOrder={setSelectedOrderId}
          />
        )}

        {activeTab === 'Órdenes' && role && (
          <OrdersView
            role={role}
            orders={orders}
            vehicles={vehicles}
            onNew={() => setNewOrderOpen(true)}
            onOpen={setSelectedOrderId}
          />
        )}

        {activeTab === 'Vehículos' && (
          <VehiclesView
            vehicles={vehicles}
            orders={orders}
            onNew={() => setNewVehicleOpen(true)}
            onOpen={setSelectedVehicleId}
          />
        )}

        {activeTab === 'Inventario' && (
          <InventoryView
            parts={parts}
            lowStock={lowStock}
            events={events}
            onConsume={consume}
            onReceive={receive}
          />
        )}

        {activeTab === 'Más' && (
          <>
            {moreView === 'MENU' && (
              <MoreView
                lowStock={lowStock}
                cloudSyncStatus={cloudSyncStatus}
                onOpen={setMoreView}
                onLogout={logout}
                onResetData={resetToSeedData}
              />
            )}
            {moreView === 'HERRAMIENTAS' && (
              <ToolsView
                tools={tools}
                onBack={() => setMoreView('MENU')}
                onToggle={toggleTool}
              />
            )}
            {moreView === 'HISTORIAL' && (
              <HistoryView events={events} onBack={() => setMoreView('MENU')} />
            )}
            {moreView === 'REPORTES' && (
              <ReportsView
                orders={orders}
                parts={parts}
                onBack={() => setMoreView('MENU')}
              />
            )}
            {moreView === 'EQUIPO' && <TeamView onBack={() => setMoreView('MENU')} />}
          </>
        )}
      </main>

      {/* Modals */}
      <NewOrderModal
        visible={newOrderOpen}
        vehicles={vehicles}
        onClose={() => setNewOrderOpen(false)}
        onSave={addOrder}
      />

      <NewVehicleModal
        visible={newVehicleOpen}
        onClose={() => setNewVehicleOpen(false)}
        onSave={addVehicle}
      />

      <OrderDetailModal
        order={selectedOrder}
        vehicle={selectedOrderVehicle}
        role={role ?? 'MECANICO'}
        onClose={() => setSelectedOrderId(null)}
        onAdvance={advanceOrder}
        onWaitPart={waitPart}
        onTask={updateTask}
        onAddTask={addTask}
      />

      <VehicleDetailModal
        vehicle={selectedVehicle}
        orders={selectedVehicleOrders}
        onClose={() => setSelectedVehicleId(null)}
        onSelectOrder={setSelectedOrderId}
      />
    </div>
  );
}
