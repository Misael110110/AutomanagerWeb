import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { Vehicle } from '../../types';

interface NewVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<Vehicle, 'id'>) => { success: boolean; message?: string };
}

export function NewVehicleModal({ visible, onClose, onSave }: NewVehicleModalProps) {
  const [plate, setPlate] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!plate.trim() || !customer.trim() || !phone.trim() || !brand.trim() || !model.trim()) {
      setErrorMsg('Complete todos los campos marcados con asterisco (*).');
      return;
    }

    const res = onSave({
      plate: plate.trim().toUpperCase(),
      customer: customer.trim(),
      phone: phone.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: year.trim() || 'Sin año',
      mileage: mileage.trim() || 'Sin registrar',
    });

    if (!res.success) {
      setErrorMsg(res.message ?? 'Error al registrar el vehículo.');
      return;
    }

    // Reset fields
    setPlate('');
    setCustomer('');
    setPhone('');
    setBrand('');
    setModel('');
    setYear('');
    setMileage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5EAF0] overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F6F8FB]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545]">
            Registrar Nuevo Vehículo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
              Placa del vehículo *
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="Ej.: M 345-982"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30 uppercase font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Teléfono de contacto *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej.: 8888-1234"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Marca *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej.: Toyota"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Modelo *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej.: Corolla"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Año
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ej.: 2018"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#425066] mb-1">
                Kilometraje
              </label>
              <input
                type="text"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Ej.: 95,000 km"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F8FB] border border-[#E5EAF0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1264A3]/30"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E5EAF0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1264A3] hover:bg-[#0E5186] shadow-xs transition-colors cursor-pointer"
            >
              Guardar vehículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
