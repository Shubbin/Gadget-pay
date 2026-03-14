import api from './api';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  specs: Record<string, string>;
  installmentEligible: boolean;
  monthlyInstallment: number;
  images: string[];
}

export const productService = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: Partial<Product>) => api.post('/products', data),
  update: (id: string, data: Partial<Product>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
};

export const installmentService = {
  getAll: () => api.get('/installments'),
  getById: (id: string) => api.get(`/installments/${id}`),
  calculate: (price: number, duration: number, frequency: string) =>
    api.post('/installments/calculate', { price, duration, frequency }),
};

export const paymentService = {
  getHistory: () => api.get('/payments'),
  getReceipts: () => api.get('/payments/receipts'),
  addCard: (data: any) => api.post('/payments/cards', data),
  removeCard: (id: string) => api.delete(`/payments/cards/${id}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getAnalytics: () => api.get('/admin/analytics'),
};
