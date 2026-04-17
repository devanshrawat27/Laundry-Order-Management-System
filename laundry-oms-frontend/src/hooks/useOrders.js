import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

/**
 * Reusable hook for fetching orders with filters + pagination.
 */
export function useOrders({ status, customerName, phone, garmentType, page = 1, limit = 10 } = {}) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (customerName) params.customerName = customerName;
      if (phone) params.phone = phone;
      if (garmentType) params.garmentType = garmentType;

      const res = await client.get('/orders', { params });
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, customerName, phone, garmentType, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, pagination, loading, error, refetch: fetchOrders };
}
