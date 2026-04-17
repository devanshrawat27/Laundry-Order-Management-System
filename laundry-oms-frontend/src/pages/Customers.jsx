import { useState, useEffect } from 'react';
import client from '../api/client';
import Loader from '../components/shared/Loader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Users } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await client.get('/dashboard/customers');
        setCustomers(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 mt-1">Aggregated list of all registered clients.</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        {error && <div className="p-8 text-center text-red-500">{error}</div>}
        
        {loading ? (
          <Loader text="Loading customers..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Customer Name</th>
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Total Orders</th>
                  <th className="p-4 font-semibold">Lifetime Spent</th>
                  <th className="p-4 font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 text-sm">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr key={customer.phoneNumber || index} className="hover:bg-surface-50/50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium flex items-center gap-3">
                        <div className="bg-brand-50 text-brand-600 p-2 rounded-full">
                           <Users size={16} />
                        </div>
                        {customer.customerName}
                      </td>
                      <td className="p-4 text-gray-500">{customer.phoneNumber}</td>
                      <td className="p-4 font-medium">{customer.totalOrders} <span className="text-gray-400 text-xs font-normal">orders</span></td>
                      <td className="p-4 font-semibold text-emerald-600">{formatCurrency(customer.totalSpent)}</td>
                      <td className="p-4 text-gray-500">{formatDate(customer.lastOrderDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
