import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Button from '../components/shared/Button';
import { formatCurrency, getGarmentLabel } from '../utils/formatters';
import Loader from '../components/shared/Loader';
import { User, UserCircle, Plus, Minus, Trash2, Rocket, Clock, AlertCircle, AlertTriangle, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [garmentPrices, setGarmentPrices] = useState({});
  const [garmentsList, setGarmentsList] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    garments: [{ type: '', quantity: 1, id: Date.now() }]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await client.get('/garments');
        setGarmentPrices(res.data);
        setGarmentsList(Object.keys(res.data));
      } catch (err) {
        toast.error('Failed to load garment prices');
      } finally {
        setInitLoading(false);
      }
    }
    loadPrices();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // clear error for field
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleGarmentChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      garments: prev.garments.map(g => {
        if (g.id !== id) return g;
        // logic to prevent empty types passing if we implement deeper validation
        let updated = { ...g, [field]: value };
        // Enforce min 1 quantity
        if (field === 'quantity' && value < 1) updated.quantity = 1;
        return updated;
      })
    }));
  };

  const addGarment = () => {
    setFormData(prev => ({
      ...prev,
      garments: [...prev.garments, { type: '', quantity: 1, id: Date.now() }]
    }));
  };

  const removeGarment = (id) => {
    setFormData(prev => ({
      ...prev,
      garments: prev.garments.filter(g => g.id !== id)
    }));
  };

  // Calculations
  const garmentTotal = formData.garments.reduce((sum, g) => {
    if (g.type && garmentPrices[g.type]) {
      return sum + (garmentPrices[g.type] * g.quantity);
    }
    return sum;
  }, 0);
  
  // Static mock fees as per design aesthetics (but using Rs.)
  const deliveryFee = garmentTotal > 0 ? 50 : 0; 
  const serviceTax = garmentTotal * 0.05;
  const totalBill = garmentTotal > 0 ? garmentTotal + deliveryFee + serviceTax : 0;
  
  // ETA calculation for display text
  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + 2);
  const etaDisplay = etaDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim() || formData.customerName.length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone must be exactly 10 digits';
    }
    if (formData.garments.length === 0) {
      toast.error('Add at least one garment');
      return false;
    }
    
    // Check if all garments have a type selected
    const unselected = formData.garments.some(g => !g.type);
    if (unselected) {
      toast.error('Please select garment type for all items');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        garments: formData.garments.map(g => ({ type: g.type, quantity: g.quantity }))
      };
      
      const res = await client.post('/orders', payload);
      toast.success('Order created successfully!');
      navigate(`/orders/${res.data.orderId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create order');
      // Set backend validation field errors if any
      if (err.response?.data?.errors) {
         // Not strictly typed, but catches general backend 400s
      }
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) return <div className="py-20 text-center"><Loader text="Preparing order form..." /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Order</h1>
        <p className="text-gray-500 mt-1">Step 1: Customer & Garment Details</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          
          {/* Customer Details Card */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
                <User size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  className={`w-full bg-surface-50 border ${errors.customerName ? 'border-red-400' : 'border-surface-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors`}
                  placeholder="e.g. John Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                />
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  className={`w-full bg-surface-50 border ${errors.phoneNumber ? 'border-red-400' : 'border-surface-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors`}
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>
          </div>

          {/* Garment Selection Card */}
          <div className="bg-surface-100/50 rounded-[24px] p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
                  {/* Simplistic Hanger icon substitute */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 8.3-6.5a1.5 1.5 0 0 1 1.8 0L21 11"/><path d="M12 4.5v-3"/><path d="M12 1.5a2.5 2.5 0 0 1 2.5 2.5"/><path d="M3 11h18"/></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Garment Selection</h2>
              </div>
              <button 
                onClick={addGarment}
                className="text-brand-600 font-semibold text-sm flex items-center gap-1 hover:text-brand-800 transition-colors"
              >
                <Plus size={16} strokeWidth={3} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.garments.map((g, index) => {
                const subtotal = (g.type && garmentPrices[g.type]) ? (garmentPrices[g.type] * g.quantity) : 0;
                return (
                  <div key={g.id} className="bg-white rounded-[20px] p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-surface-200/50">
                    <div className="flex-1 w-full relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                        Garment Type
                      </label>
                      <select
                        className="w-full appearance-none bg-transparent outline-none text-gray-800 font-bold text-lg cursor-pointer"
                        value={g.type}
                        onChange={(e) => handleGarmentChange(g.id, 'type', e.target.value)}
                      >
                        <option value="" disabled>Select garment...</option>
                        {garmentsList.map(type => (
                          <option key={type} value={type}>{getGarmentLabel(type)} (₹{garmentPrices[type]})</option>
                        ))}
                      </select>
                      <div className="absolute right-0 top-1/2 mt-1 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-end gap-10">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block text-center">
                          Quantity
                        </label>
                        <div className="flex items-center bg-surface-50 rounded-xl px-1 py-1">
                          <button onClick={() => handleGarmentChange(g.id, 'quantity', g.quantity - 1)} className="p-2 text-brand-600 hover:bg-surface-200 rounded-lg transition-colors">
                            <Minus size={16} strokeWidth={3} />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">{String(g.quantity).padStart(2, '0')}</span>
                          <button onClick={() => handleGarmentChange(g.id, 'quantity', g.quantity + 1)} className="p-2 text-brand-600 hover:bg-surface-200 rounded-lg transition-colors border-l-0">
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      <div className="pb-1 min-w-[80px]">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                          Subtotal
                        </label>
                        <div className="font-bold text-xl text-gray-900">
                          {formatCurrency(subtotal)}
                        </div>
                      </div>

                      <button 
                        onClick={() => removeGarment(g.id)}
                        disabled={formData.garments.length === 1}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 pb-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[380px] space-y-6">
          <div className="bg-white rounded-[24px] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Garments Total</span>
                <span className="font-semibold text-gray-900">{formatCurrency(garmentTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span className="font-medium flex items-center gap-1">Delivery Fee <AlertCircle size={12} className="text-brand-500" /></span>
                <span className="font-semibold text-gray-900">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Service Tax (5%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(serviceTax)}</span>
              </div>
            </div>

            <hr className="border-surface-200 my-6 border-dashed" />

            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">Total Bill</p>
                <p className="text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalBill)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">ETA</p>
                <p className="text-xl font-bold text-gray-900">24-48 Hrs</p>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 mb-8 text-emerald-800">
              <div className="bg-emerald-600 text-white rounded-full p-1.5 flex-shrink-0">
                <Clock size={16} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Estimated Delivery</p>
                <p className="font-semibold text-sm">{etaDisplay}</p>
              </div>
            </div>

            <Button
              className="w-full text-lg py-4 rounded-2xl shadow-xl shadow-brand-600/30 font-bold"
              onClick={handleSubmit}
              loading={loading}
            >
              Create Order <Rocket size={20} className="ml-1" />
            </Button>
          </div>

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">Order Options</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:border-brand-300 border border-transparent transition-colors">
              <AlertTriangle size={24} className="text-brand-600" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Express</span>
            </div>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:border-brand-300 border border-transparent transition-colors">
              <Gift size={24} className="text-brand-600" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Gift Wrap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
