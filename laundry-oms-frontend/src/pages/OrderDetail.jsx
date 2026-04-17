import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/shared/Loader';
import Button from '../components/shared/Button';
import OrderStatusBadge from '../components/Orders/OrderStatusBadge';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { ArrowLeft, User, Phone, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusLoading(true);
      await client.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await loadOrder(); // Refresh the order
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <Loader text={`Loading ${orderId}...`} />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  // Derive available next statuses
  const transitionMap = {
    RECEIVED: ['PROCESSING'],
    PROCESSING: ['READY'],
    READY: ['DELIVERED'],
    DELIVERED: []
  };
  const availableNext = transitionMap[order.status] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-[24px] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{order.orderId}</h1>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
          <p className="text-gray-500 flex items-center gap-1.5 text-sm">
            <Calendar size={14} /> Created: {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          {availableNext.map(status => (
            <Button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              loading={statusLoading}
              variant="primary"
            >
              Mark as {status}
            </Button>
          ))}
          {availableNext.length === 0 && (
            <Button disabled variant="secondary">Order Complete</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Customer Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-surface-100 p-2 rounded-lg text-gray-500"><User size={18} /></div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-surface-100 p-2 rounded-lg text-gray-500"><Phone size={18} /></div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{order.phoneNumber}</p>
              </div>
            </div>
          </div>

          <hr className="border-surface-200" />
          
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider pt-2">Delivery</h2>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Clock size={18} /></div>
            <div>
              <p className="text-xs text-gray-500">Estimated Delivery</p>
              <p className="font-semibold text-emerald-700">{formatDateTime(order.estimatedDelivery).split(',')[0]}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card !p-0 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Order Items
                <span className="bg-brand-100 text-brand-700 text-xs py-0.5 px-2 rounded-full">{order.garments.length}</span>
              </h2>
            </div>
            <div className="p-5 md:p-6 text-sm">
              <div className="space-y-4">
                {order.garments.map((g, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-surface-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-100 text-gray-500 font-medium px-2.5 py-1 rounded text-xs">
                        {g.quantity}x
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{g.type}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(g.pricePerItem)} / each</p>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {formatCurrency(g.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-surface-50 p-4 rounded-xl flex justify-between items-center border border-surface-200">
                <span className="text-gray-600 font-medium">Total Bill</span>
                <span className="text-2xl font-bold text-brand-600">{formatCurrency(order.totalBill)}</span>
              </div>
            </div>
          </div>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Status History</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-surface-200">
                {order.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-brand-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-surface-50 border border-surface-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold tracking-wide uppercase text-gray-500">{hist.from} → {hist.to}</span>
                      </div>
                      <time className="text-xs text-gray-400">{formatDateTime(hist.changedAt)}</time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
