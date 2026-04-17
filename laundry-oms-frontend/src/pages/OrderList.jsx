import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import Loader from '../components/shared/Loader';
import Input from '../components/shared/Input';
import OrderStatusBadge from '../components/Orders/OrderStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Search } from 'lucide-react';

export default function OrderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [garmentTypeFilter, setGarmentTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Simple debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Custom naive debounce for simplicity
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    // We could use a proper useDebounce hook, but setTimeout is fine here
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Decide if search term is phone or name
  const isPhone = /^\d+$/.test(debouncedSearch);
  
  const { orders, pagination, loading, error } = useOrders({
    page,
    limit: 10,
    status: statusFilter || undefined,
    phone: isPhone ? debouncedSearch : undefined,
    customerName: !isPhone && debouncedSearch ? debouncedSearch : undefined,
    garmentType: garmentTypeFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track customer requests.</p>
        </div>
        <Link to="/orders/new" className="btn-primary whitespace-nowrap">
          + New Order
        </Link>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer name or exact phone..."
            className="input-field !pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="w-full md:w-48">
          <select className="select-field" value={statusFilter} onChange={handleStatusChange}>
            <option value="">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
        <div className="w-full md:w-32">
          <select 
            className="select-field" 
            value={garmentTypeFilter} 
            onChange={(e) => { setGarmentTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Garments</option>
            <option value="SHIRT">Shirt</option>
            <option value="PANTS">Pants</option>
            <option value="SAREE">Saree</option>
            <option value="SUIT">Suit</option>
            <option value="JACKET">Jacket</option>
            <option value="DRESS">Dress</option>
            <option value="BLANKET">Blanket</option>
            <option value="CURTAINS">Curtains</option>
          </select>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        {error && <div className="p-8 text-center text-red-500">{error}</div>}
        
        {loading ? (
          <Loader text="Loading orders..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 text-sm">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-surface-50/50 transition-colors group">
                        <td className="p-4 font-medium">
                          <Link to={`/orders/${order.orderId}`} className="text-brand-600 group-hover:text-brand-800 focus:underline">
                            {order.orderId}
                          </Link>
                        </td>
                        <td className="p-4 text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="p-4 text-gray-800 font-medium">{order.customerName}</td>
                        <td className="p-4 text-gray-500">{order.phoneNumber}</td>
                        <td className="p-4 font-semibold text-gray-900">{formatCurrency(order.totalBill)}</td>
                        <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-surface-200 flex items-center justify-between bg-surface-50">
                <span className="text-sm text-gray-500">
                  Showing page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
