import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
});

// Request interceptor — attach auth
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('laundry_auth');
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

// Response interceptor — unwrap data, normalize errors, handle 401
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('laundry_auth');
      window.location.href = '/login';
    }
    const message = err.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default client;
