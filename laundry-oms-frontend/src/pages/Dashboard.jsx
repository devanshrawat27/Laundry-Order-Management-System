import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/Dashboard/StatCard';
import OrderStatusBadge from '../components/Orders/OrderStatusBadge';
import Loader from '../components/shared/Loader';
import client from '../api/client';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ShoppingBag, Coins, Sun, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await client.get('/dashboard');
        setData(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (!data) return <div className="text-center py-20 text-gray-500">No data available.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          + New Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value={data.totalOrders} 
          icon={<ShoppingBag size={20} />} 
          color="brand" 
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(data.totalRevenue)} 
          icon={<Coins size={20} />} 
          color="green" 
        />
        <StatCard 
          title="Today's Orders" 
          value={data.todayOrders} 
          icon={<Sun size={20} />} 
          color="amber" 
        />
        <StatCard 
          title="Ready For Pickup" 
          value={data.ordersByStatus?.READY || 0} 
          icon={<CheckCircle2 size={20} />} 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 text-sm">
                  {data.recentOrders?.map(order => (
                    <tr key={order.orderId} className="hover:bg-surface-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{order.orderId}</td>
                      <td className="p-4 text-gray-600">{order.customerName}</td>
                      <td className="p-4 font-semibold text-gray-900">{formatCurrency(order.totalBill)}</td>
                      <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                      <td className="p-4 text-right">
                        <Link to={`/orders/${order.orderId}`} className="text-brand-600 hover:text-brand-800 font-medium text-xs">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No recent orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Orders by Status</h2>
          <div className="card space-y-5">
            {['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'].map(status => {
              const count = data.ordersByStatus?.[status] || 0;
              const total = data.totalOrders || 1;
              const percent = Math.round((count / total) * 100);
              
              const colorMaps = {
                RECEIVED: 'bg-gray-400',
                PROCESSING: 'bg-amber-400',
                READY: 'bg-blue-400',
                DELIVERED: 'bg-emerald-400'
              };

              return (
                <div key={status}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-semibold text-gray-700">{status}</div>
                    <div className="text-sm text-gray-500 font-medium">{count} ({percent}%)</div>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className={`${colorMaps[status]} h-2 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
