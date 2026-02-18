import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('musika_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('musika_token');
      localStorage.removeItem('musika_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function extractData<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data).then((r) => extractData(r)),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => extractData(r)),

  me: () => api.get('/auth/me').then((r) => extractData(r)),
};

// ── Products ──────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }) => api.get('/products', { params }).then((r) => extractData(r)),

  getBySlug: (slug: string) => api.get(`/products/${slug}`).then((r) => extractData(r)),

  getCategories: () => api.get('/products/categories').then((r) => extractData(r)),

  create: (data: FormData | Record<string, unknown>) =>
    api.post('/products', data).then((r) => extractData(r)),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/${id}`, data).then((r) => extractData(r)),

  getMyProducts: () => api.get('/products/seller').then((r) => extractData(r)),
};

// ── Orders ────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryType: string;
    deliveryAddress?: string;
    agentLocationId?: string;
    notes?: string;
  }) => api.post('/orders', data).then((r) => extractData(r)),

  myOrders: () => api.get('/orders/my').then((r) => extractData(r)),

  getById: (id: string) => api.get(`/orders/${id}`).then((r) => extractData(r)),

  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }).then((r) => extractData(r)),
};

// ── Payments ──────────────────────────────────────────────────────
export const paymentsApi = {
  initiateEcoCash: (data: { orderId: string; method: string; phoneNumber: string }) =>
    api.post('/payments/ecocash/initiate', data).then((r) => extractData(r)),

  getStatus: (paymentId: string) =>
    api.get(`/payments/${paymentId}/status`).then((r) => extractData(r)),

  simulate: (paymentId: string, success = true) =>
    api.post(`/payments/${paymentId}/simulate`, {}, { params: { success } }).then((r) => extractData(r)),
};

// ── Sellers ───────────────────────────────────────────────────────
export const sellersApi = {
  register: (data: { storeName: string; description?: string }) =>
    api.post('/sellers/register', data).then((r) => extractData(r)),

  dashboard: () => api.get('/sellers/dashboard').then((r) => extractData(r)),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => extractData(r)),
  getUsers: (page?: number) => api.get('/admin/users', { params: { page } }).then((r) => extractData(r)),
  getPendingSellers: () => api.get('/admin/sellers/pending').then((r) => extractData(r)),
  approveSeller: (id: string) => api.post(`/admin/sellers/${id}/approve`).then((r) => extractData(r)),
  getOrders: (page?: number) => api.get('/admin/orders', { params: { page } }).then((r) => extractData(r)),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }).then((r) => extractData(r)),
};

export default api;
